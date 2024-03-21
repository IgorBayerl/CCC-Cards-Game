import re

# Define mappings from Prisma to Django field types
PRISMA_TO_DJANGO_FIELD_MAPPING = {
    "String": "CharField(max_length=255)",
    "Int": "IntegerField()",
    "Boolean": "BooleanField()"
}

# Default field type in case of no explicit mapping
DEFAULT_DJANGO_FIELD_TYPE = "TextField"

def parse_prisma_model_blocks(prisma_schema):
    """
    Extracts model blocks from a Prisma schema string.

    Args:
        prisma_schema (str): The Prisma schema file content as a string.

    Returns:
        list of tuples: A list containing tuples of model names and their body content.
    """
    return re.findall(r'model\s+(\w+)\s+\{([^}]+)\}', prisma_schema, re.DOTALL)

def map_prisma_field_to_django(field_name, field_type, is_optional):
    """
    Maps a Prisma field to a Django model field declaration.

    Args:
        field_name (str): The name of the field.
        field_type (str): The Prisma data type of the field.
        is_optional (str): Indicates if the field is optional.

    Returns:
        str: Django model field declaration.
    """
    django_field_type = PRISMA_TO_DJANGO_FIELD_MAPPING.get(field_type, DEFAULT_DJANGO_FIELD_TYPE)
    optional_params = "blank=True, null=True" if is_optional else ""

    # Special handling for the ID field
    if field_name == "id":
        return f"{field_name} = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)"
    
    return f"{field_name} = models.{django_field_type}({optional_params})"

def generate_django_model_class(model_name, model_body):
    """
    Generates Django model class definition from Prisma model block.

    Args:
        model_name (str): The name of the model.
        model_body (str): The body content of the model definition in Prisma schema.

    Returns:
        str: Django model class definition.
    """
    django_model = f"class {model_name}(models.Model):\n"
    fields = re.findall(r'\n\s+(\w+)\s+(\w+)(\?)?\s+@', model_body)
    
    for field_name, field_type, is_optional in fields:
        django_model += f"    {map_prisma_field_to_django(field_name, field_type, is_optional)}\n"
    
    # Example ForeignKey handling (simplified)
    if 'Deck' in model_body:  # Simplified check for demonstration
        django_model += "    deck = models.ForeignKey('Deck', on_delete=models.CASCADE, related_name='%(class)ss')\n"

    django_model += "\n    class Meta:\n        db_table = '" + model_name.lower() + "s'\n"
    return django_model

def convert_prisma_schema_to_django_models(prisma_schema):
    """
    Converts a Prisma schema to Django model classes.

    Args:
        prisma_schema (str): The Prisma schema file content as a string.

    Returns:
        str: The generated Django model classes.
    """
    model_blocks = parse_prisma_model_blocks(prisma_schema)
    django_models = [generate_django_model_class(name, body) for name, body in model_blocks]
    
    return "\n\n".join(django_models)

# Example usage with the provided Prisma schema
prisma_schema = """
model Deck {
  id           String   @id @default(uuid()) @map("id")
  title        String?  @map("title")
  description  String?  @map("description")
  language     String?  @map("language")
  icon         String?  @map("icon")
  darknessLevel Int?    @map("darknessLevel")
  questions    Question[]
  answers      Answer[]
  @@map("decks")
}

model Question {
  id       String @id @default(uuid()) @map("id")
  text     String? @map("text")
  spaces   Int?    @map("spaces")
  deckId   String  @map("deck_id")
  deck     Deck    @relation(fields: [deckId], references: [id])
  @@map("questions")
}

model Answer {
  id      String @id @default(uuid()) @map("id")
  text    String? @map("text")
  deckId  String  @map("deck_id")
  deck    Deck    @relation(fields: [deckId], references: [id])
  @@map("answers")
}
"""

django_code = convert_prisma_schema_to_django_models(prisma_schema)
print(django_code)
