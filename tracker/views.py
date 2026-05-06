from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from datetime import date, timedelta
from .models import DailyEntry
from .serializers import DailyEntrySerializer

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