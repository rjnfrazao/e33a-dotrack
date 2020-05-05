
from django.contrib.auth.models import AbstractUser
from django.db import models

# Variables used in the models

ORGANIZATION_TYPES = (
    ('E', 'External Organization'),
    ('F', 'Functional Area'),
    ('S', 'Sponsor'),
)


def get_profiles(user_id):
    profiles = UserProfile.objects.filter(user__id=user_id)
    profilesToStr = ""
    if profiles.exists():
        profilesToStr = ', '.join([profile.name for profile in profiles])
    return profilesToStr

# Create your models here.


class UserProfile(models.Model):
    name = models.CharField(
        "Profile Name", max_length=50, unique=True, null=False)
    productcategory = models.ManyToManyField(
        "ProductCategory",  blank=True)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"id = {self.id}, name = {self.name}, type = {self.productcategory}"


class User(AbstractUser):

    profiles = models.ManyToManyField(UserProfile)

    def __str__(self):
        return f"id = {self.id}, username = {self.username}, first_name = {self.first_name}, last_name = {self.last_name}, profiles = {get_profiles(self.id)}"

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            # "nickname": self.first_name[0] + self.last_name[0],
            "email": self.email,
        }


class ProductCategory(models.Model):
    code = models.CharField("Code", max_length=10, unique=True, null=False)
    name = models.CharField(
        "Category Name", max_length=50, unique=True, null=False)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"id = {self.id}, code = {self.code}, name = {self.name}"


class Organization(models.Model):
    code = models.CharField("Code", max_length=10, unique=True, null=False)
    name = models.CharField("Organization´s Name",
                            max_length=50, unique=True, null=False)
    type = models.CharField(
        "Type", choices=ORGANIZATION_TYPES, max_length=1, null=False)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"id = {self.id}, code = {self.code}, name = {self.name}, type = {self.type}"


class Event(models.Model):
    code = models.CharField("Code", max_length=6, unique=True, null=False)
    name = models.CharField("Event Name", max_length=20,
                            unique=True, null=False)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"id = {self.id}, code = {self.code}, name = {self.name}"


class ProductModel(models.Model):
    name = models.CharField(
        "Model´s Name", max_length=20, unique=True, null=False)
    manufacturer_code = models.CharField(
        "Manufacturer Code", max_length=40, null=True)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"id = {self.id}, name = {self.name}, manufacturer code = {self.manufacturer_code}, "


class Product(models.Model):
    code = models.CharField("Code", max_length=10, unique=True, null=False)
    name = models.CharField(
        "Product's Name", max_length=80, unique=True, null=False)
    description = models.TextField("Description", null=False)
    category = models.ForeignKey(
        ProductCategory, on_delete=models.PROTECT, null=False)
    model = models.ForeignKey(
        ProductModel, on_delete=models.PROTECT, null=True, blank=True)
    imagem = models.TextField("Imagem", null=True, blank=True)
    stocks = models.ManyToManyField(
        Event, through='ProductStock', null=True, blank=True)
    creation_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"id = {self.id}, code = {self.code}, name = {self.name}, creation_date = {self.creation_date}, category = {self.category.name}"

    def serialize(self, user_id):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "description": self.description,
            "category_id": self.category.id,
            "category": self.category.name,
            "model_id": self.model.id,
            "model": self.model.name,
            "creation_date": self.creation_date.strftime("%b %d %Y"),
            "owner": User.objects.filter(id=user_id, profiles__productcategory__product__id=self.id).count()
        }


class ProductStock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    event = models.ForeignKey(Event, on_delete=models.PROTECT)
    max_quantity = models.IntegerField(default=0)
    creation_date = models.DateTimeField(auto_now_add=True)


class Demand(models.Model):
    event = models.ForeignKey(Event, on_delete=models.PROTECT, null=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT, null=False)
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, null=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT, null=False)
    quantity = models.IntegerField("Quantity", default=0, null=False)
    status = models.CharField("Status", max_length=3,
                              default="REQ", null=False)
    request_id = models.CharField("Code", max_length=10, null=True)
    creation_date = models.DateTimeField(auto_now_add=True)
