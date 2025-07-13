# require 'rails_helper'
#
# RSpec.describe Api::V1::SessionsController, type: :controller do
#   include Devise::Test::ControllerHelpers
#
#   before do
#     @request.env["devise.mapping"] = Devise.mappings[:user]
#   end
#
#   let(:user) { User.create!(email: 'test@example.com', password: 'password') }
#
#   describe 'POST #create' do
#     context 'with valid credentials' do
#       it 'returns a JWT token' do
#         # Bypass the Devise authentication flow and directly call respond_with
#         # which is your custom method that generates the JWT
#         allow(request.env['warden']).to receive(:authenticate!).and_return(user)
#         allow(controller).to receive(:resource).and_return(user)
#
#         # Call the create action manually and bypass authentication
#         controller.instance_variable_set(:@resource, user)
#         allow(controller).to receive(:warden).and_return(request.env['warden'])
#
#         # Mock the respond_with method to avoid Devise complications
#         expect(controller).to receive(:respond_with).with(user, {}).and_call_original
#
#         # Call the action
#         post :create, params: { user: { email: user.email, password: 'password' } }
#
#         # Test expectations on the response
#         expect(response).to have_http_status(:ok)
#       end
#     end
#
#     context 'with invalid credentials' do
#       it 'returns unauthorized' do
#         # Set up the request to fail authentication
#         allow(request.env['warden']).to receive(:authenticate!).and_throw(:warden, scope: :user)
#
#         post :create, params: { user: { email: user.email, password: 'wrong_password' } }
#         expect(response).to have_http_status(:unauthorized)
#       end
#     end
#   end
#
#   describe 'DELETE #destroy' do
#     it 'returns a successful response' do
#       # Setup a mock current_user
#       allow(controller).to receive(:current_user).and_return(user)
#
#       # Set up Warden mock to avoid testing Devise's logout flow
#       warden = double('warden')
#       allow(controller).to receive(:warden).and_return(warden)
#       allow(warden).to receive(:user).with(anything).and_return(user)
#       allow(warden).to receive(:logout).with(anything)
#
#       # Just test that your custom respond_to_on_destroy method is called
#       expect(controller).to receive(:respond_to_on_destroy).and_call_original
#
#       delete :destroy
#       expect(response).to have_http_status(:ok)
#     end
#   end
# end