# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create admin user in development and test environments
if Rails.env.development? || Rails.env.test?
  puts "Creating admin user..."

  admin = User.find_by(email: "admin@faktubuh.com")

  unless admin
    # Create user without admin flag first
    admin = User.new(
      email: "admin@faktubuh.com",
      full_name: "Admin User",
      password: "password123",
      personal_id: "ADMIN1",
      confirmed_at: Time.current
    )
    admin.save!
    # Then set admin flag directly in database to bypass attr_readonly
    admin.update_column(:admin, true)
    puts "✓ Admin user created: admin@faktubuh.com / password123"
  else
    puts "✓ Admin user already exists"
  end
end
