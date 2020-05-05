from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

import json

from .models import User, Product, ProductCategory, ProductModel, UserProfile, ProductStock

# Global Variables
gbl_page_size = 10      # page size for the number o items to be displayed

#
# Function return the json element to be returned, so javascript knows how
# render navigation buttons.
# Parameter - count : number of records of the dataset,
#             offset - current offset to be displayed.


def pages(count, offset):

    previous = -1
    next = -1

    pages = {"count": count, "offset": offset, "previous": -1, "next": -1}

    if count == 0:
        # no records return default page, no previous no next button
        return pages

    previous = offset-gbl_page_size         # previous offset
    next = offset+gbl_page_size             # next offset
    pages["previous"] = previous
    pages["next"] = next

    if next >= count:
        # if next bigger than count, hide next button
        pages["next"] = -1
    if previous < 0:
        # hide previous button
        pages["previous"] = -1

    return pages

#
#   Page loaded after user is logged in.
#   This loads also all smaller lists needed in the forms. Those are lists which does´t changes too much
#   avoid frequent http requets to load the lists. Downside, user has to log out and log in again to update the lists.
#


def index(request):

    return render(request, "product/index.html", {
        # ProductCategory.objects.order_by("name").all(),
        "categories": ProductCategory.objects.filter(userprofile__user__id=request.user.id),
        "models": ProductModel.objects.order_by("name").all()
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "product/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "product/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "product/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(
                username, email, password, first_name=first_name, last_name=last_name,)
            user.save()
        except IntegrityError:
            return render(request, "product/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "product/register.html")


"""
API to save the product.
"""
@csrf_exempt
@login_required
def upd_product(request):

    # Post a new message must be via POST
    if request.method != "PUT":
        return JsonResponse({"error": "POST request required."}, status=400)

    # checked if the user is logged, store in temporary variable.
    if request.user.is_authenticated:
        user_id = request.user.id
    else:
        user_id = 0

    # Get message of post
    data = json.loads(request.body)
    p = data.get('product', '')
    #print(f"Product : {data.get('product', '')}")

    # Check of message was filled in.
    if (data.get("product", "") == ""):
        # return error message
        return JsonResponse({
            "error": "Message content is required."
        }, status=400)
    else:
        # Add a new product.
        product = Product.objects.get(id=p["id"])
        category = ProductCategory.objects.get(id=p["category"])
        model = ProductModel.objects.get(id=p["model"])
        product.code = p["code"]
        product.name = p["name"]
        product.category = category
        product.model = model
        product.description = p["description"]
        product.save()

    product = product.serialize(user_id)

    # Return the product updated
    response = {}
    response["products"] = product

    return JsonResponse(response, status=201)


"""
API to add a new product.
"""
@csrf_exempt
@login_required
def add_product(request):

    # Post a new message must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # checked if the user is logged, store in temporary variable.
    if request.user.is_authenticated:
        user_id = request.user.id
    else:
        user_id = 0

    # Get product data
    data = json.loads(request.body)
    product = data.get("product", "")

    #print(f"Product : {data.get('product', '')}")
    # Check of message was filled in.
    if (data.get("product", "") == ""):
        # return error message
        return JsonResponse({
            "error": "Message content is required."
        }, status=400)
    else:
        # Add a new product.
        category_id = int(product["category"])
        model_id = int(product["model"])
        category = ProductCategory.objects.get(
            id=category_id)
        model = ProductModel.objects.get(id=model_id)
        product = Product(
            code=product["code"],
            name=product["name"],
            category=category,
            model=model,
            description=product["description"]
        )
        product.save()

        product = product.serialize(user_id)

        # Retorna produto salvo, assim o Javascript consegue mostrar a pagina do produto salvo.
        response = {}
        response["products"] = product

        return JsonResponse(response, status=201)


"""
API to return the user profile. This view is invoked from a javascript called load_profile().
Return profile in JSON format.

Input: username(GET param) - Used to get the profile by username.
"""
@csrf_exempt
@login_required
def get_profile(request):

    # check if get method
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    # Compare user name with current user.
    try:
        # Return user's data
        get_username = request.GET["username"]
        user_profile = User.objects.get(username=get_username)

        # Json data to return are user data + additional information
        user_dict = user_profile.serialize()

        return JsonResponse(user_dict, safe=False)

    except:
        return JsonResponse({"Internal error": "Loading profile."}, status=400)


"""
API to return the product catalog.

User doesn´t need to be logged to perform this search.

Pagination information is returned to the front end, in order to render the page.

Input:
    f(GET param) - Used to filter the products based on partial search in the product name.

"""
@csrf_exempt
def get_catalog(request):

    # check if get method
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    # checked if the user is logged, store in temporary variable.
    if request.user.is_authenticated:
        user_id = request.user.id
    else:
        user_id = 0

    offset = int(request.GET["offset"])
    filter = request.GET["f"]
    limit = offset + gbl_page_size

    if (filter == ""):
        count = Product.objects.all().count()
        products = Product.objects.order_by("id").all()[offset:limit]
    else:
        count = Product.objects.filter(
            name__contains=filter).count()
        products = Product.objects.order_by("id").filter(
            name__contains=filter)[offset:limit]

    products = [product.serialize(user_id)
                for product in products]

    response = {}
    try:
        # Add Pages info to the response to implement pagination.
        response["pages"] = pages(count, offset)
    except:
        pass

    response["products"] = products

    return JsonResponse(response, safe=False)
    # except:
    #    return JsonResponse({"API get_catalog error": "Undefined error, when returning the catalog"}, status=400)


"""
API to return a product, base on the url param

User doesn´t need to be logged to perform this search.

Input:
    product_code - url parameter passed, with the product code.
"""
@csrf_exempt
def get_product(request, product_code):

    # check if get method
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    # checked if the user is logged, store in temporary variable.
    if request.user.is_authenticated:
        user_id = request.user.id
    else:
        user_id = 0

    count = 1
    offset = 0
    # Return the product from the database
    products = Product.objects.get(code=product_code)
    # create the json format from the product returned.
    products = products.serialize(user_id)

    response = {}
    try:
        # Add Pages info to the response to implement pagination.
        response["pages"] = pages(count, offset)
    except:
        pass

    response["products"] = products

    return JsonResponse(response, safe=False)
    # except:
    #    return JsonResponse({"API get_products error": "Undefined error, when returning products"}, status=400)
