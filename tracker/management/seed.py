from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Create demo user for production'

    def handle(self, *args, **kwargs):
        if User.objects.filter(username='demo').exists():
            self.stdout.write('Demo user already exists.')
            return
        user  = User.objects.create_user(
            username='demo', password='grindtracker2026'
        )
        Token.objects.create(user=user)
        self.stdout.write(self.style.SUCCESS(
            'Demo user created: demo / grindtracker2026'
        ))