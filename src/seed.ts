import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { CelebrationRequest } from './celebration-request.entity';
import { Occasion } from './occasion.entity';

// Configuración de conexión a la base de datos
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd-celebration',
  entities: [User, CelebrationRequest, Occasion],
  synchronize: true,
});

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    // Inicializar conexión
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida\n');

    const userRepository = AppDataSource.getRepository(User);
    const celebrationRepository =
      AppDataSource.getRepository(CelebrationRequest);

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    // Deshabilitar verificaciones de claves foráneas temporalmente
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    const occasionRepository = AppDataSource.getRepository(Occasion);
    await celebrationRepository.clear();
    await userRepository.clear();
    await occasionRepository.clear();
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Datos existentes eliminados\n');

    // ============================================
    // Crear Ocasiones
    // ============================================
    console.log('🎉 Creando ocasiones especiales...');

    const occasions = [
      {
        name: 'San Valentín',
        slug: 'celebration',
        icon: 'heart',
        primaryColor: '#ec4899',
        secondaryColor: '#ef4444',
        description: 'Celebra el amor y el cariño especial',
        sortOrder: 1,
      },
      {
        name: 'Aniversario',
        slug: 'aniversario',
        icon: 'rings',
        primaryColor: '#4f46e5', // Indigo-600
        secondaryColor: '#e0e7ff', // Indigo-100
        description: 'Celebra el tiempo compartido juntos',
        sortOrder: 2,
      },
      {
        name: 'Año Nuevo',
        slug: 'ano-nuevo',
        icon: 'clock',
        primaryColor: '#ca8a04', // Darker Gold/Yellow-600
        secondaryColor: '#fef08a', // Light Yellow-200
        description: 'Nuevos comienzos y metas compartidas',
        sortOrder: 3,
      },
      {
        name: 'Navidad',
        slug: 'navidad',
        icon: 'tree',
        primaryColor: '#16a34a',
        secondaryColor: '#dc2626',
        description: 'Celebra la unión y las tradiciones',
        sortOrder: 4,
      },
      {
        name: 'Cumpleaños',
        slug: 'cumpleanos',
        icon: 'cake',
        primaryColor: '#9333ea', // Purple-600
        secondaryColor: '#f3e8ff', // Purple-100
        description: 'Celebra un año más de vida de esa persona especial',
        sortOrder: 5,
      },
      {
        name: 'Halloween',
        slug: 'halloween',
        icon: 'pumpkin',
        primaryColor: '#ea580c', // Orange-600
        secondaryColor: '#000000', // Black
        description: 'Diversión y celebración temática',
        sortOrder: 6,
      },
      {
        name: 'Fiestas Patrias',
        slug: 'fiestas-patrias',
        icon: 'flag-pe',
        primaryColor: '#dc2626', // Red-600
        secondaryColor: '#ffffff', // White
        description: 'Celebra el orgullo nacional peruano',
        sortOrder: 7,
      },
      {
        name: 'Semana Santa',
        slug: 'semana-santa',
        icon: 'palm',
        primaryColor: '#0891b2',
        secondaryColor: '#cffafe', // Cyan-100
        description: 'Escapada y momentos de desconexión',
        sortOrder: 8,
      },
      {
        name: 'Celebración Especial', // Renamed from "Otro (Personalizado)"
        slug: 'personalizado',
        icon: 'sparkles',
        primaryColor: '#2563eb', // Royal Blue - Distinct from Birthday Purple
        secondaryColor: '#dbeafe', // Blue-100
        description: 'Crea tu propia ocasión especial',
        sortOrder: 9,
      },
    ];

    const createdOccasions: Occasion[] = [];
    for (const occasionData of occasions) {
      const occasion = occasionRepository.create(occasionData);
      const saved = await occasionRepository.save(occasion);
      createdOccasions.push(saved);
    }

    console.log(`✅ ${createdOccasions.length} ocasiones creadas\n`);

    // ============================================
    // Crear Usuario Administrador
    // ============================================
    console.log('👥 Creando usuario administrador...');

    const adminUser = userRepository.create({
      email: 'davidzapata.dz051099@gmail.com',
      googleId: '106222933094249241890',
      name: 'David Zapata',
      role: 'admin',
      status: 'active',
      maxRequests: null, // Sin límite para admin
      avatar:
        'https://lh3.googleusercontent.com/a/ACg8ocJ3xg70lH6OCzg6U9AccsXECShr1dKMXHELEFgMStshyUwRbrd8=s96-c',
    });

    await userRepository.save(adminUser);
    console.log(`✅ Usuario administrador creado: ${adminUser.name}\n`);

    // ============================================
    // Resumen
    // ============================================
    console.log('📊 Resumen del seed:');
    console.log('─────────────────────────────────────');
    console.log(`🎉 Ocasiones creadas: ${createdOccasions.length}`);
    console.log(`   - San Valentín, Aniversario, Año Nuevo`);
    console.log(`   - Navidad, Cumpleaños, Halloween`);
    console.log(`   - Fiestas Patrias, Semana Santa, Personalizado`);
    console.log('');
    console.log(`👥 Usuarios creados: 1`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Nombre: ${adminUser.name}`);
    console.log(`   - Rol: ${adminUser.role}`);
    console.log(`   - Estado: ${adminUser.status}`);
    console.log('─────────────────────────────────────');
    console.log('\n✨ Seed completado exitosamente!\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar el seed
void seed();
