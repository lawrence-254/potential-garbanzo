                <div class="mt-16">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
                        @if(isset($products))
                        @foreach ($products as $product)
                        <div class="p-6 bg-white dark:bg-gray-500/50 dark:bg-gradient-to-bl from-gray-700/50 via-transparent dark:ring-1 dark:ring-inset dark:ring-white/5 rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex flex-col motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500">
                            <div class="flex items-center justify-center mb-4">
                                <img src="{{ asset($product->image_name) }}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="w-30 h-30 stroke-red-500">
                            </div>
                            <div class="text-center">
                                <h2 class="text-lg font-semibold">{{ $product->name }}</h2>
                                <div class="text-m text-gray-900">
                                    <h3>Was: <span class="line-through text-red-700 mr-2">${{ $product->price }}</span></h3>
                                    <h3>Now: <span class="text-green-700"> ${{ $product->sale_price }}</span></h3>
                                </div>
                            </div>
                            <add-to-cart-button/>
                        </div>
                        @endforeach
                        @endif
                    </div>
                </div>
           