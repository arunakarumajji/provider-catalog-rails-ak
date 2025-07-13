class ProviderSerializer
  include JSONAPI::Serializer

  attributes :id, :npi, :first_name, :last_name, :specialty, :credentials,
             :address_line1, :address_line2, :city, :state, :zip,
             :phone, :email, :active, :created_at, :updated_at

  attribute :full_name do |object|
    "#{object.first_name} #{object.last_name}"
  end

  attribute :full_address do |object|
    address = [object.address_line1]
    address << object.address_line2 if object.address_line2.present?
    address << "#{object.city}, #{object.state} #{object.zip}"
    address.join(", ")
  end

  attribute :profile_image_url do |provider|
    if provider.profile_image.attached?
      "http://localhost:3000/api/v1/profile_images/#{provider.id}"
    else
      nil
    end
  end
end