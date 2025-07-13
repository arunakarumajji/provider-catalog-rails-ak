# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
require 'net/http'
require 'uri'

specialties = [
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Obstetrics and Gynecology",
  "Orthopedic Surgery",
  "Psychiatry",
  "Radiology",
  "Urology",
  "Oncology",
  "Emergency Medicine"
]

credentials = ["MD", "DO", "NP", "PA", "LCSW", "PhD", "PsyD", "DDS", "DPM", "OD", "PT"]

def generate_npi
  "#{rand(1..2)}#{rand(100000000..999999999)}"
end

puts "Creating 100 providers..."

100.times do |i|
  provider = Provider.new(
    npi: generate_npi,
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name,
    specialty: specialties.sample,
    credentials: credentials.sample,
    address_line1: Faker::Address.street_address,
    address_line2: [nil, Faker::Address.secondary_address].sample,
    city: Faker::Address.city,
    state: Faker::Address.state_abbr,
    zip: Faker::Address.zip_code,
    phone: Faker::PhoneNumber.phone_number,
    email: Faker::Internet.email,
    active: [true, true, true, false].sample
  )

  # Download a real image or use a placeholder
  avatar_url = Faker::Avatar.image
  uri = URI.parse(avatar_url)
  avatar_file = Net::HTTP.get(uri)
  provider.profile_image.attach(
    io: StringIO.new(avatar_file),
    filename: "avatar-#{i}.png",
    content_type: "image/png"
  )

  provider.save!

  # Progress indicator
  puts "Created provider #{i+1}/100" if (i+1) % 10 == 0
end

puts "Seed completed! Created 100 provider records."