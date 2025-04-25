using System.ComponentModel.DataAnnotations;

namespace InvoiceApp.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }
        [Required]
        public string Price { get; set; }
    }
}
