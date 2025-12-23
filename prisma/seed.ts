import { PrismaClient, UserRole, ServiceType, BookingStatus, InvoiceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (optional, uncomment if needed)
  // await prisma.auditLog.deleteMany()
  // await prisma.message.deleteMany()
  // await prisma.payment.deleteMany()
  // await prisma.invoice.deleteMany()
  // await prisma.checklistItem.deleteMany()
  // await prisma.cleanerAssignment.deleteMany()
  // await prisma.booking.deleteMany()
  // await prisma.service.deleteMany()
  // await prisma.address.deleteMany()
  // await prisma.cleaner.deleteMany()
  // await prisma.customer.deleteMany()
  // await prisma.user.deleteMany()
  // await prisma.workspace.deleteMany()

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Clean Sweep Demo',
      slug: 'clean-sweep-demo',
      timezone: 'America/New_York',
      currency: 'USD',
      cancellationPolicyHours: 24,
      requireDeposit: true,
      depositPercent: 25,
    },
  })

  console.log('✅ Created workspace:', workspace.name)

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cleansweep.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+15555551000',
      role: UserRole.ADMIN,
      workspaceId: workspace.id,
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create dispatcher user
  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher@cleansweep.com',
      password: hashedPassword,
      name: 'Dispatcher User',
      phone: '+15555551001',
      role: UserRole.DISPATCHER,
      workspaceId: workspace.id,
    },
  })

  console.log('✅ Created dispatcher user:', dispatcherUser.email)

  // Create cleaner users
  const cleaner1User = await prisma.user.create({
    data: {
      email: 'maria@cleansweep.com',
      password: hashedPassword,
      name: 'Maria Garcia',
      phone: '+15555552000',
      role: UserRole.CLEANER,
      workspaceId: workspace.id,
    },
  })

  const cleaner1 = await prisma.cleaner.create({
    data: {
      userId: cleaner1User.id,
      workspaceId: workspace.id,
      firstName: 'Maria',
      lastName: 'Garcia',
      email: cleaner1User.email,
      phone: cleaner1User.phone!,
      hourlyRate: 20.00,
      hireDate: new Date('2024-01-01'),
      color: '#3b82f6',
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
      },
    },
  })

  const cleaner2User = await prisma.user.create({
    data: {
      email: 'john@cleansweep.com',
      password: hashedPassword,
      name: 'John Smith',
      phone: '+15555552001',
      role: UserRole.CLEANER,
      workspaceId: workspace.id,
    },
  })

  const cleaner2 = await prisma.cleaner.create({
    data: {
      userId: cleaner2User.id,
      workspaceId: workspace.id,
      firstName: 'John',
      lastName: 'Smith',
      email: cleaner2User.email,
      phone: cleaner2User.phone!,
      hourlyRate: 22.00,
      hireDate: new Date('2024-02-01'),
      color: '#10b981',
      availability: {
        monday: { start: '08:00', end: '16:00' },
        tuesday: { start: '08:00', end: '16:00' },
        wednesday: { start: '08:00', end: '16:00' },
        thursday: { start: '08:00', end: '16:00' },
        friday: { start: '08:00', end: '16:00' },
      },
    },
  })

  console.log('✅ Created cleaners:', cleaner1.firstName, cleaner2.firstName)

  // Create customer users
  const customer1User = await prisma.user.create({
    data: {
      email: 'jane.doe@example.com',
      password: hashedPassword,
      name: 'Jane Doe',
      phone: '+15555553000',
      role: UserRole.CUSTOMER,
      workspaceId: workspace.id,
    },
  })

  const customer1 = await prisma.customer.create({
    data: {
      userId: customer1User.id,
      workspaceId: workspace.id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: customer1User.email,
      phone: customer1User.phone!,
      tags: ['vip', 'recurring'],
      source: 'referral',
    },
  })

  const customer1Address = await prisma.address.create({
    data: {
      customerId: customer1.id,
      street: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'US',
      label: 'Home',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      isDefault: true,
    },
  })

  const customer2User = await prisma.user.create({
    data: {
      email: 'bob.johnson@example.com',
      password: hashedPassword,
      name: 'Bob Johnson',
      phone: '+15555553001',
      role: UserRole.CUSTOMER,
      workspaceId: workspace.id,
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      userId: customer2User.id,
      workspaceId: workspace.id,
      firstName: 'Bob',
      lastName: 'Johnson',
      email: customer2User.email,
      phone: customer2User.phone!,
      tags: ['new'],
      source: 'google',
    },
  })

  const customer2Address = await prisma.address.create({
    data: {
      customerId: customer2.id,
      street: '456 Oak Avenue',
      unit: 'Apt 2B',
      city: 'Austin',
      state: 'TX',
      zip: '78702',
      country: 'US',
      label: 'Apartment',
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 1200,
      isDefault: true,
    },
  })

  console.log('✅ Created customers:', customer1.firstName, customer2.firstName)

  // Create services
  const standardService = await prisma.service.create({
    data: {
      workspaceId: workspace.id,
      name: 'Standard Cleaning',
      type: ServiceType.STANDARD,
      description: 'Regular maintenance cleaning for your home',
      basePrice: 120.00,
      pricingModel: 'FLAT',
      estimatedMinutes: 120,
      checklistTemplate: [
        { title: 'Kitchen - Clean counters and sink', description: 'Wipe down all surfaces' },
        { title: 'Kitchen - Clean appliances', description: 'Clean stovetop, microwave exterior' },
        { title: 'Bathrooms - Clean toilet, sink, tub', description: 'Scrub and disinfect' },
        { title: 'Bathrooms - Clean mirrors', description: 'Wipe clean' },
        { title: 'Bedrooms - Dust surfaces', description: 'All flat surfaces' },
        { title: 'Living areas - Vacuum and mop', description: 'All floors' },
        { title: 'Take out trash', description: 'All rooms' },
      ],
    },
  })

  const deepService = await prisma.service.create({
    data: {
      workspaceId: workspace.id,
      name: 'Deep Cleaning',
      type: ServiceType.DEEP,
      description: 'Thorough deep cleaning including baseboards, windows, and more',
      basePrice: 250.00,
      pricingModel: 'FLAT',
      estimatedMinutes: 240,
      checklistTemplate: [
        { title: 'All standard cleaning tasks', description: '' },
        { title: 'Clean baseboards', description: 'All rooms' },
        { title: 'Clean inside windows', description: 'All accessible windows' },
        { title: 'Clean inside cabinets', description: 'Kitchen and bathrooms' },
        { title: 'Clean inside refrigerator', description: 'Remove shelves and clean' },
        { title: 'Clean oven', description: 'Interior deep clean' },
        { title: 'Dust ceiling fans and light fixtures', description: 'All rooms' },
      ],
    },
  })

  const moveOutService = await prisma.service.create({
    data: {
      workspaceId: workspace.id,
      name: 'Move-Out Cleaning',
      type: ServiceType.MOVE_OUT,
      description: 'Complete cleaning for move-out/move-in',
      basePrice: 350.00,
      pricingModel: 'FLAT',
      estimatedMinutes: 360,
    },
  })

  console.log('✅ Created services:', standardService.name, deepService.name, moveOutService.name)

  // Create bookings
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const booking1 = await prisma.booking.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer1.id,
      addressId: customer1Address.id,
      serviceId: standardService.id,
      scheduledDate: tomorrow,
      scheduledTime: '09:00',
      durationMinutes: standardService.estimatedMinutes,
      status: BookingStatus.CONFIRMED,
      subtotal: standardService.basePrice,
      tax: standardService.basePrice * 0.08,
      total: standardService.basePrice * 1.08,
      notes: 'First-time customer',
    },
  })

  // Create checklist items for booking1
  const checklistTemplate = standardService.checklistTemplate as any[]
  await Promise.all(
    checklistTemplate.map((item, index) =>
      prisma.checklistItem.create({
        data: {
          bookingId: booking1.id,
          title: item.title,
          description: item.description,
          sortOrder: index,
        },
      })
    )
  )

  // Assign cleaner to booking
  await prisma.cleanerAssignment.create({
    data: {
      bookingId: booking1.id,
      cleanerId: cleaner1.id,
    },
  })

  // Create invoice for booking1
  await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      bookingId: booking1.id,
      customerId: customer1.id,
      invoiceNumber: 'INV-2024-0001',
      subtotal: booking1.subtotal,
      tax: booking1.tax,
      total: booking1.total,
      status: InvoiceStatus.PENDING,
      dueDate: tomorrow,
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer2.id,
      addressId: customer2Address.id,
      serviceId: deepService.id,
      scheduledDate: nextWeek,
      scheduledTime: '10:00',
      durationMinutes: deepService.estimatedMinutes,
      status: BookingStatus.CONFIRMED,
      subtotal: deepService.basePrice,
      tax: deepService.basePrice * 0.08,
      total: deepService.basePrice * 1.08,
    },
  })

  await prisma.cleanerAssignment.create({
    data: {
      bookingId: booking2.id,
      cleanerId: cleaner2.id,
    },
  })

  await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      bookingId: booking2.id,
      customerId: customer2.id,
      invoiceNumber: 'INV-2024-0002',
      subtotal: booking2.subtotal,
      tax: booking2.tax,
      total: booking2.total,
      status: InvoiceStatus.PENDING,
      dueDate: nextWeek,
    },
  })

  console.log('✅ Created bookings with invoices and assignments')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('Admin:      admin@cleansweep.com / Admin123!')
  console.log('Dispatcher: dispatcher@cleansweep.com / Admin123!')
  console.log('Cleaner 1:  maria@cleansweep.com / Admin123!')
  console.log('Cleaner 2:  john@cleansweep.com / Admin123!')
  console.log('Customer 1: jane.doe@example.com / Admin123!')
  console.log('Customer 2: bob.johnson@example.com / Admin123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
