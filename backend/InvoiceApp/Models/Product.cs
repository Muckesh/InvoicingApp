using System.ComponentModel.DataAnnotations;

namespace InvoiceApp.Models
{
    public class Product
    {
        [Key]
        public int ProductId { get; set; }
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }
        [Required]
        public decimal Price { get; set; }
    }
}
