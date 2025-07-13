require 'rails_helper'

RSpec.describe Api::V1::ProvidersController, type: :controller do
  let(:user) { User.create!(email: 'test@example.com', password: 'password123') }
  let!(:providers) do
    5.times.map do |i|
      Provider.create!(
        npi: "12345#{i}",
        first_name: "FirstName#{i}",
        last_name: "LastName#{i}",
        specialty: "Specialty#{i}",
        credentials: "MD",
        address_line1: "123 Main St",
        city: "Boston",
        state: "MA",
        zip: "02118",
        phone: "555-123-456#{i}",
        email: "provider#{i}@example.com",
        active: true
      )
    end
  end
  let(:provider_id) { providers.first.id }
  let(:valid_attributes) {
    {
      npi: '1234567890',
      first_name: 'John',
      last_name: 'Doe',
      specialty: 'Cardiology',
      credentials: 'MD',
      address_line1: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zip: '02118',
      phone: '555-123-4567',
      email: 'john.doe@example.com'
    }
  }

  before do
    request.headers.merge!(auth_headers(user))
  end

  describe 'GET #index' do
    it 'returns a successful response' do
      get :index
      expect(response).to be_successful
    end

    it 'filters by specialty' do
      cardiology_provider = Provider.create!(
        npi: '9876543210',
        first_name: 'Jane',
        last_name: 'Cardio',
        specialty: 'Cardiology',
        credentials: 'MD',
        address_line1: '456 Heart St',
        city: 'Boston',
        state: 'MA',
        zip: '02118',
        phone: '555-987-6543',
        email: 'jane.cardio@example.com',
        active: true
      )
      get :index, params: { specialty: 'Cardiology' }

      json_response = JSON.parse(response.body)
      provider_ids = json_response['data'].map { |p| p['id'].to_i }

      expect(provider_ids).to include(cardiology_provider.id)
    end

    it 'filters by location' do
      # First, verify that all the default providers have city "Boston"
      # and will be returned by the filter

      # Create a provider in a different city first for contrast
      non_boston_provider = Provider.create!(
        npi: '9999999999',
        first_name: 'Not',
        last_name: 'Boston',
        specialty: 'Family Medicine',
        credentials: 'MD',
        address_line1: '123 Other St',
        city: 'Chicago', # Different city
        state: 'IL',
        zip: '60601',
        phone: '555-999-9999',
        email: 'not.boston@example.com',
        active: true
      )

      get :index, params: { location: 'Boston' }

      json_response = JSON.parse(response.body)

      # Check that we get a successful response
      expect(response).to be_successful

      # Check that we have results (we know our test data includes Boston providers)
      expect(json_response['data']).to be_present

      # Check that all returned providers have Boston in their address
      json_response['data'].each do |provider_data|
        expect(provider_data['attributes']['city']).to eq('Boston')
      end

      # Check that non-Boston providers are not included
      provider_ids = json_response['data'].map { |p| p['id'].to_i }
      expect(provider_ids).not_to include(non_boston_provider.id)
    end
  end

  describe 'Authentication' do
    it 'returns unauthorized without a token' do

      request.headers['Authorization'] = nil

      get :index
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns unauthorized with an invalid token' do
      request.headers['Authorization'] = 'Bearer invalid_token'

      get :index
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET #show' do
    it 'returns a successful response' do
      get :show, params: { id: provider_id }
      expect(response).to be_successful
    end
  end

  describe 'POST #create' do
    it 'creates a new provider' do
      expect {
        post :create, params: { provider: valid_attributes }
      }.to change(Provider, :count).by(1)

      expect(response).to have_http_status(:created)
    end
  end

  describe 'PUT #update' do
    it 'updates the provider' do
      new_attributes = { first_name: 'Jane' }
      put :update, params: { id: provider_id, provider: new_attributes }

      provider = Provider.find(provider_id)
      expect(provider.first_name).to eq('Jane')
      expect(response).to be_successful
    end
  end

  describe 'DELETE #destroy' do
    it 'soft deletes the provider' do
      delete :destroy, params: { id: provider_id }

      provider = Provider.find(provider_id)
      expect(provider.active).to be_falsey
      expect(response).to be_successful
    end
  end
end