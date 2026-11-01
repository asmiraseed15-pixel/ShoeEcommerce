from pathlib import Path
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from products.models import Category, Product

media_folder = Path("media/products")

product_groups = {
    "Women": [
        "girls1.png", "girls2.png", "girls3.png", "girls4.png",
        "girls5.png", "girls6.png", "girls7.png", "girls8.png",
        "girl9.png", "girl10.png", "girl11.jpg", "girl12.png"
    ],
    "Men": [f"boy{i}.png" for i in range(1, 13)],
    "Kids": [
        "kids1.png", "kids2.png", "kids4.png", "kids5.png",
        "kids6.png", "kids7.png", "kids8.png", "kids9.png",
        "kids10.png", "kids11.png", "kids12.png"
    ],
}

created_count = 0
skipped_count = 0

for category_name, images in product_groups.items():
    category = Category.objects.get(name=category_name)

    for index, image_name in enumerate(images, start=1):
        if not (media_folder / image_name).exists():
            print("Missing:", image_name)
            skipped_count += 1
            continue

        slug = f"{category_name.lower()}-shoe-{index}"

        product, created = Product.objects.get_or_create(
            slug=slug,
            defaults={
                "category": category,
                "name": f"{category_name} Shoe {index}",
                "description": f"Stylish and comfortable {category_name.lower()} footwear.",
                "price": 799 + index * 100,
                "original_price": 1299 + index * 100,
                "stock": 20,
                "rating": 4.5,
                "review_count": 10 + index,
                "style": "Casual",
                "brand": "StepUp",
                "colors": ["Black", "White"],
                "sizes": ["6", "7", "8", "9", "10"],
                "specifications": [],
                "is_active": True,
                "image": f"products/{image_name}",
            },
        )

        if created:
            created_count += 1
            print("Created:", product.name)
        else:
            skipped_count += 1
            print("Already exists:", product.name)

print("\nImport completed!")
print("Created:", created_count)
print("Skipped:", skipped_count)
print("Total products:", Product.objects.count())