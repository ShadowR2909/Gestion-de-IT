from django.core.management.base import BaseCommand
from gestion.models import TipoEquipo

class Command(BaseCommand):
    help = 'Crea los tipos de equipos iniciales'

    def handle(self, *args, **kwargs):
        tipos = [
            {'nombre': 'Netbook', 'descripcion': 'Computadora portátil compacta'},
            {'nombre': 'Tablet', 'descripcion': 'Dispositivo táctil portátil'},
            {'nombre': 'CPU de Escritorio', 'descripcion': 'Computadora de escritorio'},
            {'nombre': 'Monitor', 'descripcion': 'Pantalla de visualización'},
            {'nombre': 'Impresora', 'descripcion': 'Dispositivo de impresión'},
        ]
        
        for tipo_data in tipos:
            tipo, created = TipoEquipo.objects.get_or_create(
                nombre=tipo_data['nombre'],
                defaults={'descripcion': tipo_data['descripcion']}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Tipo de equipo "{tipo.nombre}" creado exitosamente')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Tipo de equipo "{tipo.nombre}" ya existe')
                )