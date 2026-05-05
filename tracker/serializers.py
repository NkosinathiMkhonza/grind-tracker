from rest_framework import serializers
from .models import DailyEntry

class DailyEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model  = DailyEntry
        fields = ['id','date','hours_coded','applications_sent','notes','created_at','updated_at']
        read_only_fields = ['id','created_at','updated_at']

    def validate_hours_coded(self, value):
        if value < 0 or value > 24:
            raise serializers.ValidationError("Hours must be between 0 and 24.")
        return value