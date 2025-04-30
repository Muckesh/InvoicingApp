+----------------+     +----------------+         +---------------+
|   Customers    |     |   Invoices     |         |   Products    |
+----------------+     +----------------+         +---------------+
| PK: CustomerId |<----| PK: InvoiceId  |------>  | PK: ProductId |
|      Name      |     | FK: CustomerId |         |    Name       |
|      Email     |     |     Date       |         | Description   |
|      Phone     |     |     DueDate    |         |    Price      |
|      Address   |     |     Total      |         +---------------+
+----------------+     |    Status      |
                       +----------------+
                          ^
                          |
                          |
                   +--------------+
                   | InvoiceItems |
                   +--------------+
                   | PK: ItemId   |
                   | FK: InvoiceId|
                   | FK: ProductId|
                   |   Quantity   |
                   |  UnitPrice   |
                   +--------------+


┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Customers  │         │  Invoices   │         │  Products   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│▪ CustomerId │◄──────┐ │▪ InvoiceId  │┌───────►│▪ ProductId  │
│  Name       │       │ │  CustomerId ││        │  Name       │
│  Email      │       │ │  Date       ││        │ Description │
│  Phone      │       │ │  DueDate    ││        │  Price      │
│  Address    │       │ │  Total      ││        └─────────────┘
└─────────────┘       │ │  Status     ││
                      │ └─────────────┘│
                      │                │
                      │ ┌─────────────┐│
                      └─┤InvoiceItems │◄┘
                        ├─────────────┤
                        │▪ ItemId     │
                        │  InvoiceId  │
                        │  ProductId  │
                        │  Quantity   │
                        │  UnitPrice  │
                        └─────────────┘