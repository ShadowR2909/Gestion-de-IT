from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TipoEquipoViewSet, ClienteViewSet, TecnicoViewSet, 
    EquipoViewSet, OrdenTrabajoViewSet, RepuestoViewSet
)

router = DefaultRouter()
router.register(r'tipos-equipo', TipoEquipoViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'tecnicos', TecnicoViewSet)
router.register(r'equipos', EquipoViewSet)
router.register(r'ordenes', OrdenTrabajoViewSet)
router.register(r'repuestos', RepuestoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]