from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from app_dtgu.models import *


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserAdmin(UserAdmin):
    inlines = (ProfileInline,)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Profile)
admin.site.register(UserGroup)
admin.site.register(University)
admin.site.register(Marks)
admin.site.register(ParamsMarks)
admin.site.register(TypeMarks)
admin.site.register(Specialty)
admin.site.register(Subject)
