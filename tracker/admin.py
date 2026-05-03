from django.contrib import admin
from .models import DailyEntry


@admin.register(DailyEntry)
class DailyEntryAdmin(admin.ModelAdmin):
    list_display  = ['user', 'date', 'hours_coded', 'applications_sent', 'created_at']
    list_filter   = ['user', 'date']
    search_fields = ['user__username', 'notes']
    ordering      = ['-date']