class Provider < ApplicationRecord
  has_one_attached :profile_image

  validates :npi, presence: true, uniqueness: { message: "Identifier is already taken" }
  validates :first_name, :last_name, :specialty, presence: true
  # Profile image validations
  validates :profile_image, content_type: { in: ['image/png', 'image/jpeg', 'image/gif'],
                                            message: 'must be a valid image format (JPEG, GIF or PNG)' },
             size: { less_than: 5.megabytes,
                    message: 'must be less than 5MB' },
             allow_blank: true

  scope :active, -> { where(active: true) }
  scope :by_specialty, ->(specialty) { where(specialty: specialty) if specialty.present? }
  scope :by_location, ->(location) { where("city LIKE ? OR state LIKE ?", "%#{location}%", "%#{location}%") if location.present? }
end
