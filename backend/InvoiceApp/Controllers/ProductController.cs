using InvoiceApp.Data;
using InvoiceApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly InvoiceAppContext _context;

        public ProductController(InvoiceAppContext context)
        {
            _context = context;
        }
        // GET : api/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }



        // GET : api/Product/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        // POST : api/Product
        [HttpPost]

        public async Task<ActionResult<Customer>> CreateProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
        }

        // DELETE : api/Product/id
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(true);
        }
    }
}
