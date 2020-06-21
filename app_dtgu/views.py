import json

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.template.context_processors import csrf
from django.contrib.auth import authenticate, logout, login
from app_dtgu.models import *
from pandas.io import json


def index(request):
    try:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        print(ip)
        if not Count.objects.filter(ip=ip).exists():
            Count.objects.create(name=request.META.get('USERNAME'), ip=ip)
    except:
        print("error")

    return render(request, 'index.html')


def index_init(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    args = {
        'TypeMarks': list(TypeMarks.objects.all().values()),
        'Specialty': list(Specialty.objects.all().values()),
    }
    args.update(csrf(request))

    return HttpResponse(json.dumps(args))


def calc_marks(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    args = {}
    type_test = request.POST.get('type_id')
    specialty_id = request.POST.get('speciality_id')
    marks = Marks.objects.filter(university__id=request.user.profile.university_id).filter(typeMarks=type_test)

    args = {
        'marks': list(marks.values()),
        'paramsMarks': list(ParamsMarks.objects.all().values())
    }

    args.update(csrf(request))
    return HttpResponse(json.dumps(args))


def login_view(request):
    args = {}
    args.update(csrf(request))
    username = request.POST.get('username')
    password = request.POST.get('password')
    if username and password:
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                args['reload'] = True
        else:
            args['text_error'] = 'Вы ввели неверный логин или пароль'
    else:
        args['text_error'] = 'Вы не указали логин или пароль'
    return HttpResponse(json.dumps(args))


def logout_view(request):
    args = {}
    args.update(csrf(request))
    args['reload'] = True
    logout(request)
    return HttpResponse(json.dumps(args))


def logout_force(request):
    logout(request)
    return HttpResponseRedirect('/')


# УПРАВЛЕНИЕ Специальнсотями
def specialty_control(request):
    return render(request, 'settings/speciality_control.html', {})


def specialty_control_init(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    if request.user.profile.group.name != 'Администратор':
        return HttpResponse(json.dumps({'unauthorized': True}))

    specialty = Specialty.objects.all()

    args = {
        'specialty': list(specialty.values()),
    }
    args.update(csrf(request))
    return HttpResponse(json.dumps(args))


def work_specialty(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    if request.user.profile.group.name != 'Администратор':
        return HttpResponse(json.dumps({'unauthorized': True}))

    args = {}
    args.update(csrf(request))
    id = request.POST['id']
    name = request.POST['name']
    name_en = request.POST['name_en']
    code = request.POST['code']
    code_en = request.POST['code_en']

    if id == '-1':
        specialty = Specialty.objects.create(name=name, name_en=name_en, code=code,code_en=code_en)
        args['text_success'] = 'Специальность успешно создана'
    else:
        specialty = Specialty.objects.filter(pk=id).first()
        specialty.name = name
        specialty.name_en = name_en
        specialty.code = code
        specialty.code_en = code_en
        args['text_success'] = 'Данные обновленны'

    specialty.save()

    args['specialty'] = list(Specialty.objects.filter(pk=specialty.id).values())

    return HttpResponse(json.dumps(args))


def delete_specialty(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    if request.user.profile.group.name != 'Администратор':
        return HttpResponse(json.dumps({'unauthorized': True}))
    args = {}
    args.update(csrf(request))

    items = request.POST['items']

    if items != '':
        for u in Specialty.objects.filter(pk__in=items.split(',')):
            u.delete()
        args['text_success'] = 'Данные удалены'
    args['reload'] = False

    return HttpResponse(json.dumps(args))


# УПРАВЛЕНИЕ АККАУНТАМИ
def account_control(request):
    return render(request, 'settings/account_control.html', {})


def account_control_init(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    if request.user.profile.group.name != 'Администратор':
        return HttpResponse(json.dumps({'unauthorized': True}))

    profile = User.objects.filter(profile__university__id=request.user.profile.university_id)
    group = UserGroup.objects.all()
    profile_group = Profile.objects.all()

    args = {
        'profile': list(profile.values()),
        'group': list(group.values()),
        'profile_group': list(profile_group.values()),
    }
    args.update(csrf(request))
    return HttpResponse(json.dumps(args))


def test_username(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    username = request.POST['username']

    args = {
        'user_test': User.objects.filter(username=username).count()
    }
    args.update(csrf(request))
    return HttpResponse(json.dumps(args))


def work_user_profile(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    if request.user.profile.group.name != 'Администратор':
        return HttpResponse(json.dumps({'unauthorized': True}))

    args = {}
    args.update(csrf(request))
    id = request.POST['id']
    username = request.POST['username']
    first_name = request.POST['first_name']
    group = request.POST['group']
    is_active = request.POST['is_active']
    password = request.POST['password']

    if group == '':
        group = UserGroup.objects.filter(name='Администратор').first()
    else:
        group = UserGroup.objects.filter(pk=group).first()


    if id == '-1':
        user = User.objects.create_user(username, 'default@mail.ru', password, first_name=first_name)
        args['text_success'] = 'Профиль успешно создан'
    else:
        user = User.objects.filter(pk=id).first()
        user.username = username
        user.first_name = first_name
        if password != '':
            user.set_password(password)
        args['text_success'] = 'Данные профиля обновленны'

    if is_active == "1":
        user.is_active = True
    else:
        user.is_active = False

    user.save()

    u_tz = Profile.objects.filter(user=user).first()
    if u_tz is not None:
        u_tz.group = group
    else:
        u_tz = Profile(
            user=user,
            group=group,
            university=request.user.profile.university
        )
    u_tz.save()

    args['user'] = list(User.objects.filter(pk=user.id).values())
    args['group'] = list(Profile.objects.filter(user=user).values())

    return HttpResponse(json.dumps(args))


def delete_admin_user_profile(request):
    if not request.user.is_active:
        return HttpResponse(json.dumps({'unactive': True}))

    if request.user.profile.group.name != 'Администратор':
        return HttpResponse(json.dumps({'unauthorized': True}))
    args = {}
    args.update(csrf(request))

    items = request.POST['items']

    if items != '':
        for u in User.objects.filter(pk__in=items.split(',')):
            Profile.objects.filter(user=u).delete()
            u.delete()
        args['text_success'] = 'Данные удалены'
    args['reload'] = False

    return HttpResponse(json.dumps(args))