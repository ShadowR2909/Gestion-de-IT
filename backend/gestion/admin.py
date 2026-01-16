from django.contrib import admin
from .models import TipoEquipo, Cliente, Tecnico, Equipo, OrdenTrabajo, Repuesto


@admin.register(TipoEquipo)
class TipoEquipoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'activo', 'fecha_creacion']
    list_filter = ['activo']
    search_fields = ['nombre']


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['apellido', 'nombre', 'dni', 'telefono', 'email', 'activo']
    list_filter = ['activo', 'fecha_registro']
    search_fields = ['nombre', 'apellido', 'dni', 'email']


@admin.register(Tecnico)
class TecnicoAdmin(admin.ModelAdmin):
    list_display = ['apellido', 'nombre', 'dni', 'especialidad', 'activo']
    list_filter = ['activo', 'fecha_ingreso']
    search_fields = ['nombre', 'apellido', 'dni', 'especialidad']


@admin.register(Equipo)
class EquipoAdmin(admin.ModelAdmin):
    list_display = ['tipo_equipo', 'marca', 'modelo', 'cliente', 'numero_serie']
    list_filter = ['tipo_equipo', 'fecha_registro']
    search_fields = ['marca', 'modelo', 'numero_serie', 'cliente__nombre', 'cliente__apellido']


class RepuestoInline(admin.TabularInline):
    model = Repuesto
    extra = 1


@admin.register(OrdenTrabajo)
class OrdenTrabajoAdmin(admin.ModelAdmin):
    list_display = ['numero_orden', 'equipo', 'tecnico', 'estado', 'fecha_ingreso', 'costo_total']
    list_filter = ['estado', 'tipo_pago', 'fecha_ingreso']
    search_fields = ['numero_orden', 'equipo__cliente__nombre', 'equipo__cliente__apellido']
    inlines = [RepuestoInline]
    readonly_fields = ['numero_orden', 'costo_total']


@admin.register(Repuesto)
class RepuestoAdmin(admin.ModelAdmin):
    list_display = ['descripcion', 'orden_trabajo', 'cantidad', 'precio_unitario', 'precio_total']
    search_fields = ['descripcion', 'orden_trabajo__numero_orden']