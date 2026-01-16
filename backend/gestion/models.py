from django.db import models
from django.core.validators import EmailValidator, RegexValidator

class TipoEquipo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Tipo de Equipo"
        verbose_name_plural = "Tipos de Equipos"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    email = models.EmailField(validators=[EmailValidator()])
    direccion = models.TextField()
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['-fecha_registro']
    
    def __str__(self):
        return f"{self.apellido}, {self.nombre} - DNI: {self.dni}"


class Tecnico(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    email = models.EmailField(validators=[EmailValidator()])
    especialidad = models.CharField(max_length=200)
    fecha_ingreso = models.DateField()
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Técnico"
        verbose_name_plural = "Técnicos"
        ordering = ['apellido', 'nombre']
    
    def __str__(self):
        return f"{self.apellido}, {self.nombre}"


class Equipo(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='equipos')
    tipo_equipo = models.ForeignKey(TipoEquipo, on_delete=models.PROTECT, related_name='equipos')
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    numero_serie = models.CharField(max_length=100, unique=True, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Equipo"
        verbose_name_plural = "Equipos"
        ordering = ['-fecha_registro']
    
    def __str__(self):
        return f"{self.tipo_equipo.nombre} - {self.marca} {self.modelo} ({self.cliente})"


class OrdenTrabajo(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROCESO', 'En Proceso'),
        ('ESPERANDO_REPUESTO', 'Esperando Repuesto'),
        ('FINALIZADO', 'Finalizado'),
        ('ENTREGADO', 'Entregado'),
        ('CANCELADO', 'Cancelado'),
    ]
    
    TIPO_PAGO_CHOICES = [
        ('EFECTIVO', 'Efectivo'),
        ('TRANSFERENCIA', 'Transferencia'),
        ('TARJETA', 'Tarjeta'),
        ('PENDIENTE', 'Pendiente'),
    ]
    
    numero_orden = models.CharField(max_length=20, unique=True, editable=False)
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE, related_name='ordenes')
    tecnico = models.ForeignKey(Tecnico, on_delete=models.SET_NULL, null=True, related_name='ordenes')
    
    fecha_ingreso = models.DateTimeField(auto_now_add=True)
    fecha_estimada_entrega = models.DateField(null=True, blank=True)
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    
    problema_reportado = models.TextField()
    diagnostico = models.TextField(blank=True, null=True)
    trabajo_realizado = models.TextField(blank=True, null=True)
    
    costo_mano_obra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    costo_repuestos = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    monto_pagado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tipo_pago = models.CharField(max_length=20, choices=TIPO_PAGO_CHOICES, default='PENDIENTE')
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    observaciones = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Orden de Trabajo"
        verbose_name_plural = "Órdenes de Trabajo"
        ordering = ['-fecha_ingreso']
    
    def save(self, *args, **kwargs):
        if not self.numero_orden:
            # Generar número de orden automático
            ultimo = OrdenTrabajo.objects.all().order_by('-id').first()
            if ultimo:
                numero = int(ultimo.numero_orden.split('-')[1]) + 1
            else:
                numero = 1
            self.numero_orden = f"OT-{numero:06d}"
        
        # Calcular costo total
        self.costo_total = self.costo_mano_obra + self.costo_repuestos
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.numero_orden} - {self.equipo.cliente}"
    
    @property
    def saldo_pendiente(self):
        return self.costo_total - self.monto_pagado


class Repuesto(models.Model):
    orden_trabajo = models.ForeignKey(OrdenTrabajo, on_delete=models.CASCADE, related_name='repuestos')
    descripcion = models.CharField(max_length=200)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    precio_total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    
    class Meta:
        verbose_name = "Repuesto"
        verbose_name_plural = "Repuestos"
    
    def save(self, *args, **kwargs):
        self.precio_total = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.descripcion} - {self.orden_trabajo.numero_orden}"