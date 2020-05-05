
from django.urls import path

from . import views

urlpatterns = [
    # Pages
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API
    path("catalog/", views.get_catalog, name="get_catalog"),
    path("get/<str:product_code>", views.get_product, name="get_product"),
    path("add/", views.add_product, name="add_product"),
    path("update/", views.upd_product, name="upd_product"),
]
