class CreateProviders < ActiveRecord::Migration[8.0]
  def change
    create_table :providers do |t|
      t.string :npi
      t.string :first_name
      t.string :last_name
      t.string :specialty
      t.string :credentials
      t.string :address_line1
      t.string :address_line2
      t.string :city
      t.string :state
      t.string :zip
      t.string :phone
      t.string :email
      t.boolean :active

      t.timestamps
    end
  end
end
