Rails.application.routes.draw do
  mount GoodJob::Engine, at: "good_job"

  devise_for :users, controllers: { registrations: "users/registrations", sessions: "users/sessions",
                                    omniauth_callbacks: "users/omniauth_callbacks" }

  devise_scope :user do
    authenticated :user do
      root "dashboard#index", as: :authenticated_root
    end

    unauthenticated do
      root "users/sessions#new", as: :unauthenticated_root
    end
  end

  get "dashboard", to: "dashboard#index"
  resource :profile, only: %i[show update]
  resources :debts, only: %i[new create show index] do
    member do
      post :confirm
      post :reject
      post :upgrade
      post :accept_upgrade
      post :decline_upgrade
    end
    resources :payments, only: %i[create] do
      member do
        post :approve
        post :reject
      end
    end
    resources :witnesses, only: %i[create] do
      member do
        post :confirm
        post :decline
      end
    end
  end

  resources :notifications, only: %i[index] do
    member do
      post :mark_read
    end
    collection do
      post :mark_all_read
    end
  end

  get "users/lookup", to: "users#lookup"

  get "privacy", to: "pages#privacy"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  root "home#index"
end
