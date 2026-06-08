from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from datetime import date, timedelta
from .models import DailyEntry
from .serializers import DailyEntrySerializer
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

class EntryListCreateView(generics.ListCreateAPIView):
    serializer_class   = DailyEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = DailyEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyEntry.objects.filter(user=self.request.user)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = DailyEntry.objects.filter(user=request.user)
        total_hours = entries.aggregate(Sum('hours_coded'))['hours_coded__sum'] or 0
        total_apps  = entries.aggregate(Sum('applications_sent'))['applications_sent__sum'] or 0
        streak = self.calculate_streak(request.user)
        return Response({'total_hours': total_hours, 'total_applications': total_apps, 'streak': streak})

    def calculate_streak(self, user):
        today   = date.today()
        streak  = 0
        current = today
        while DailyEntry.objects.filter(user=user, date=current).exists():
            streak  += 1
            current -= timedelta(days=1)
        return streak
    

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email    = request.data.get('email', '')

        if not username or not password:
            return Response({'error': 'Username and password required.'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=400)

        user  = User.objects.create_user(username=username, password=password, email=email)
        token = Token.objects.create(user=user)
        return Response({'token': token.key, 'username': user.username}, status=201)
    
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = []