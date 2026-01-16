from rest_framework import serializers
from .models import TipoEquipo, Cliente, Tecnico, Equipo, OrdenTrabajo, Repuesto


class TipoEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEquipo
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    total_equipos = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = '__all__'
    
    def get_total_equipos(self, obj):
        return obj.equipos.count()


class TecnicoSerializer(serializers.ModelSerializer):
    total_ordenes = serializers.SerializerMethodField()
    
    class Meta:
        model = Tecnico
        fields = '__all__'
    
    def get_total_ordenes(self, obj):
        return obj.ordenes.count()


class EquipoSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.__str__', read_only=True)
    tipo_equipo_nombre = serializers.CharField(source='tipo_equipo.nombre', read_only=True)
    total_ordenes = serializers.SerializerMethodField()
    
    class Meta:
        model = Equipo
        fields = '__all__'
    
    def get_total_ordenes(self, obj):
        return obj.ordenes.count()


class RepuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repuesto
        fields = '__all__'
        read_only_fields = ['precio_total']


class OrdenTrabajoSerializer(serializers.ModelSerializer):
    equipo_detalle = EquipoSerializer(source='equipo', read_only=True)
    cliente_nombre = serializers.CharField(source='equipo.cliente.__str__', read_only=True)
    tecnico_nombre = serializers.CharField(source='tecnico.__str__', read_only=True)
    repuestos = RepuestoSerializer(many=True, read_only=True)
    saldo_pendiente = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrdenTrabajo
        fields = '__all__'
        read_only_fields = ['numero_orden', 'costo_total']


class OrdenTrabajoCreateSerializer(serializers.ModelSerializer):
    repuestos_data = RepuestoSerializer(many=True, required=False)
    
    class Meta:
        model = OrdenTrabajo
        fields = '__all__'
        read_only_fields = ['numero_orden', 'costo_total']
    
    def create(self, validated_data):
        repuestos_data = validated_data.pop('repuestos_data', [])
        orden = OrdenTrabajo.objects.create(**validated_data)
        
        for repuesto_data in repuestos_data:
            Repuesto.objects.create(orden_trabajo=orden, **repuesto_data)
        
        # Recalcular costo de repuestos
        orden.costo_repuestos = sum(r.precio_total for r in orden.repuestos.all())
        orden.save()
        
        return orden


class ClienteDetalleSerializer(serializers.ModelSerializer):
    equipos = EquipoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cliente
        fields = '__all__'