
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace iDoctor.Infrastructure.Data.Migrations
{
    public partial class AddClinicPhotoUrl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "clinics",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "clinics");
        }
    }
}
