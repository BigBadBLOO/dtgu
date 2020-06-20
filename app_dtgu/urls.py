from django.urls import path, include

from app_dtgu.views import *

urlpatterns = [
    path('', index, name="index"),
    path('index_init/', index_init, name="index_init"),
    path('calc_marks/', calc_marks, name="calc_marks"),

    path('login_view/', login_view, name="login_view"),
    path('logout_view/', logout_view, name="logout_view"),
    path('logout_force/', logout_force, name="logout_force"),

    path('specialty_control/', specialty_control, name="specialty_control"),
    path('specialty_control_init/', specialty_control_init, name="specialty_control_init"),
    path('work_specialty/', work_specialty, name="work_specialty"),
    path('delete_specialty/', delete_specialty, name="delete_specialty"),


    path('account_control/', account_control, name="account_control"),
    path('account_control_init/', account_control_init, name="account_control_init"),
    path('test_username/', test_username, name="test_username"),
    path('work_user_profile/', work_user_profile, name="work_user_profile"),
    path('delete_admin_user_profile/', delete_admin_user_profile, name="delete_admin_user_profile"),
]