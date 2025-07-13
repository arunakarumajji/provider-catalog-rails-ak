Rails.application.routes.draw do
  devise_for :users, skip: [:sessions, :registrations, :passwords]
  namespace :api do
    namespace :v1 do
      # get "providers/index"
      # get "providers/show"
      # get "providers/create"
      # get "providers/update"
      # get "providers/destroy"
      get '/profile_images/:id', to: 'profile_images#show'
      devise_scope :user do
      post 'login', to: 'sessions#create'
      delete 'logout', to: 'sessions#destroy'
      post 'register', to: 'registrations#create'
      end

      resources :providers
    end
  end

end
