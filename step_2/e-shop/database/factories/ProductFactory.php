<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->text(25);
        $price = $this->faker->randomFloat(2,100, 9999);
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->text(100),
            'image_name' => $this->faker->imageUrl($width = 640, $height = 480),
            'price' => $price,
            'sale_price'=> $price-50,
        ];
    }
}
