using InvoiceApp.Data;
using InvoiceApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvoiceApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly InvoiceAppContext _context;

        public InvoiceController(InvoiceAppContext context)
        {
            _context = context;
        }

        // GET : api/Invoice
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        {
            return await _context.Invoices.Include(i => i.Customer).Include(i => i.Items).ThenInclude(item => item.Product).ToListAsync();
        }

        // GET : api/Invoice/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Invoice>> GetInvoice(int id)
        {
            var invoice = await _context.Invoices.Include(i => i.Customer).Include(i => i.Items).ThenInclude(item => item.Product).FirstOrDefaultAsync(i => i.InvoiceId == id);

            if (invoice == null)
            {
                return NotFound();
            }

            return invoice;
        }

        // POST : api/invoice
        [HttpPost]
        public async Task<ActionResult<Invoice>> CreateInvoice(InvoiceRequest invoiceRequest)
        {
            var customer = await _context.Customers.FindAsync(invoiceRequest.CustomerId);
            if (customer == null)
            {
                return BadRequest("Customer not found.");
            }

            var invoice = new Invoice
            {
                CustomerId = invoiceRequest.CustomerId,
                InvoiceDate = DateTime.Now,
                DueDate = invoiceRequest.DueDate,
                Status = "Pending"
            };

            decimal totalAmount = 0;

            foreach(var itemRequest in invoiceRequest.Items)
            {
                var product = await _context.Products.FindAsync(itemRequest.ProductId);
                if (product == null)
                {
                    return BadRequest($"Product with ID {itemRequest.ProductId} not found.");
                }

                var item = new InvoiceItem
                {
                    ProductId = itemRequest.ProductId,
                    Quantity = itemRequest.Quantity,
                    UnitPrice = product.Price
                };

                totalAmount += item.Quantity * item.UnitPrice;
                invoice.Items.Add(item);
            }

            invoice.TotalAmount = totalAmount;

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInvoice), new {id = invoice.InvoiceId},invoice);
        }

        // DELETE : api/Invoice/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                return NotFound();
            }

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
