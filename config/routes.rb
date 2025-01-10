Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  devise_scope :user do
    authenticated :user do
      root to: "pages#home"
    end

    unauthenticated :user do
      root to: "pages#home", as: :unauthenticated_root
    end
  end

  defaults export: true do
    devise_for :users,
               controllers: { registrations: "users/registrations", omniauth_callbacks: "users/omniauth_callbacks" },
               skip: [ :sessions, :registrations, :confirmation ]

    devise_scope :user do
      get "/users/edit", to: "users/registrations#edit", as: :edit_user_registration
      put "/users", to: "users/registrations#update", as: :update_user_registration
      delete "/users/sign_out", to: "devise/sessions#destroy", as: :destroy_user_session
    end
  end
end
