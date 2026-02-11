Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "users/registrations", sessions: "users/sessions",
                                    omniauth_callbacks: "users/omniauth_callbacks" }

  devise_scope :user do
    authenticated :user do
      root "home#index", as: :authenticated_root
    end

    unauthenticated do
      root "users/sessions#new", as: :unauthenticated_root
    end
  end

  resource :profile, only: %i[show update]
  resources :debts, only: %i[new create show index] do
    member do
      post :confirm
      post :reject
    end
    resources :payments, only: %i[create]
  end

  get "users/lookup", to: "users#lookup"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  root "home#index"
end
