class AddProfileImageToProviders < ActiveRecord::Migration[8.0]
  def change
    add_column :providers, :profile_image, :string
  end
end
