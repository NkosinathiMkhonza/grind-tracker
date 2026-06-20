from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.authtoken.views import obtain_auth_token

from rest_framework.authtoken.views import obtain_auth_token
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('admin/',      admin.site.urls),
    path('api/',        include('tracker.urls')),
    path('api/login/',  csrf_exempt(obtain_auth_token), name='api-login'),
    path('',            TemplateView.as_view(template_name='base.html'), name='home'),
    path('login',       TemplateView.as_view(template_name='base.html'), name='login'),
    path('register',    TemplateView.as_view(template_name='base.html'), name='register'),
    path('dashboard',   TemplateView.as_view(template_name='base.html'), name='dashboard'),
    path('profile', TemplateView.as_view(template_name='base.html'), name='profile'),
]