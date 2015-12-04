Rails.application.routes.draw do
  get 'lobby' => 'boards#index'
  post 'boards/users' => 'boards#users'
  post 'boards/join' => 'boards#join'
  post 'boards/leave' => 'boards#leave'

  # check if the table is full when user just join in game
  post 'game/board_full' => 'game#board_full'

  # check if enough players to start
  # post 'game/start' => 'game#start'

  # post that user_id is ready
  post 'game/ready' => 'game#ready'

  # add and remove tokens
  post 'game/add_token' => 'game#add_token'
  post 'game/remove_token' => 'game#remove_token'

  # get board data through ajax
  get 'lobby/boards' => 'lobby#boards' #first time access lobby and generate list of boards

  post 'boards/discard' => 'boards#discard'
  resources :boards

  get 'chats' => 'chats#index'
  post 'chats' => 'chats#post'
  devise_for :users

  get 'welcome/index'

  root 'welcome#index'

  devise_scope :user do
    get 'users/sign_out' => 'devise/sessions#destroy'

  end

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
