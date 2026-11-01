from django.db import models


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default="StepUp")
    logo_url = models.URLField(blank=True)
    primary_color = models.CharField(max_length=20, default="#087CF0")
    secondary_color = models.CharField(max_length=20, default="#D4E1FA")
    font_family = models.CharField(max_length=50, default="Roboto")
    announcement_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.site_name


class HomePageSection(models.Model):
    SECTION_TYPES = [
        ("hero", "Hero Banner"),
        ("banner", "Banner"),
        ("category", "Category"),
        ("products", "Products"),
        ("text", "Text Content"),
        ("image", "Image"),
    ]

    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    button_text = models.CharField(max_length=100, blank=True)
    button_link = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    def __str__(self):
        return self.title or self.get_section_type_display()


class AboutPage(models.Model):
    title = models.CharField(max_length=200, default="About Us")
    subtitle = models.CharField(max_length=300, blank=True)
    content = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class ContactPage(models.Model):
    title = models.CharField(max_length=200, default="Contact Us")
    description = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)

    def __str__(self):
        return self.title