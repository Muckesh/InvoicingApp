using System.ComponentModel.DataAnnotations;

namespace InvoiceApp.Models
{
    public class Invoice
    {
        public int InvoiceId { get; set; }
        public int CustomerId { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public Customer Customer { get; set; }
        public List<InvoiceItem> Items { get; set; }
    }

    public class InvoiceItem
    {
        [Key]
        public int ItemId { get; set; }
        public int InvoiceId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public Product Product { get; set; }
    }

    public class InvoiceRequest
    {
        public int CustomerId { get; set; }
        public DateTime DueDate { get; set; }
        public List<InvoiceItemRequest> Items
        {
            get; set;
        }
    }

    public class InvoiceItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
