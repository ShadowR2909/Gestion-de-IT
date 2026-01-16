import mercadopago
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import TipoEquipo, Cliente, Tecnico, Equipo, OrdenTrabajo, Repuesto
from .serializers import (
    TipoEquipoSerializer, ClienteSerializer, TecnicoSerializer,
    EquipoSerializer, OrdenTrabajoSerializer, RepuestoSerializer,
    ClienteDetalleSerializer, OrdenTrabajoCreateSerializer
)

class TipoEquipoViewSet(viewsets.ModelViewSet):
    queryset = TipoEquipo.objects.all()
    serializer_class = TipoEquipoSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    
    @action(detail=True, methods=['get'])
    def detalle(self, request, pk=None):
        cliente = self.get_object()
        serializer = ClienteDetalleSerializer(cliente)
        return Response(serializer.data)

class TecnicoViewSet(viewsets.ModelViewSet):
    queryset = Tecnico.objects.all()
    serializer_class = TecnicoSerializer

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = OrdenTrabajo.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrdenTrabajoCreateSerializer
        return OrdenTrabajoSerializer

    @action(detail=True, methods=['post'])
    def registrar_pago(self, request, pk=None):
        orden = self.get_object()
        monto = request.data.get('monto')
        try:
            monto = float(monto)
            orden.monto_pagado = float(orden.monto_pagado) + monto
            orden.save()
            return Response(self.get_serializer(orden).data)
        except:
            return Response({'error': 'Monto inválido'}, status=400)

    @action(detail=True, methods=['post'])
    def pagar_mp(self, request, pk=None):
        orden = self.get_object()
        sdk = mercadopago.SDK("TU_ACCESS_TOKEN_AQUI")
        preference_data = {
            "items": [{"title": f"Orden {orden.numero_orden}", "quantity": 1, "unit_price": float(orden.saldo_pendiente), "currency_id": "ARS"}],
            "back_urls": {"success": "http://localhost:5173/ordenes", "failure": "http://localhost:5173/ordenes"},
            "auto_return": "approved",
        }
        res = sdk.preference().create(preference_data)
        return Response({'init_point': res["response"]["init_point"]})

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        return Response({
            'total_ordenes': OrdenTrabajo.objects.count(),
            'pendientes': OrdenTrabajo.objects.filter(estado='PENDIENTE').count(),
            'en_proceso': OrdenTrabajo.objects.filter(estado='EN_PROCESO').count(),
            'finalizadas': OrdenTrabajo.objects.filter(estado='FINALIZADO').count()
        })

class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuesto.objects.all()
    serializer_class = RepuestoSerializer