FactoryBot.define do
  factory :provider do
    npi { Faker::Number.number(digits: 10) }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    specialty { ['Cardiology', 'Neurology', 'Pediatrics', 'Family Medicine'].sample }
    credentials { ['MD', 'DO', 'NP', 'PA'].sample }
    address_line1 { Faker::Address.street_address }
    address_line2 { [nil, Faker::Address.secondary_address].sample }
    city { Faker::Address.city }
    state { Faker::Address.state_abbr }
    zip { Faker::Address.zip_code }
    phone { Faker::PhoneNumber.phone_number }
    email { Faker::Internet.email }
    active { true }
  end
end