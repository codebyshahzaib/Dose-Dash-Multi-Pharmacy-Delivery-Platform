/*
  Warnings:

  - You are about to drop the column `phone` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `pharmacy_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `rider_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `pharmacists` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `pharmacists` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `pharmacy_owners` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `pharmacy_owners` table. All the data in the column will be lost.
  - You are about to drop the column `license_number` on the `pharmacy_owners` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `pharmacy_owners` table. All the data in the column will be lost.
  - You are about to drop the column `pharmacy_name` on the `pharmacy_owners` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `pharmacy_owners` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `riders` table. All the data in the column will be lost.
  - You are about to drop the `inventories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[proposal_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `salt` to the `medicines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `proposal_id` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updated_at` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `proposals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';

-- AlterEnum
ALTER TYPE "PrescriptionStatus" ADD VALUE 'PROPOSED';

-- DropForeignKey
ALTER TABLE "inventories" DROP CONSTRAINT "inventories_medicine_id_fkey";

-- DropForeignKey
ALTER TABLE "inventories" DROP CONSTRAINT "inventories_pharmacy_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_medicine_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_pharmacy_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_rider_id_fkey";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "phone",
ADD COLUMN     "city" TEXT;

-- AlterTable
ALTER TABLE "medicines" ADD COLUMN     "form" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "pack_size" TEXT,
ADD COLUMN     "salt" TEXT NOT NULL,
ADD COLUMN     "strength" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "pharmacy_id",
DROP COLUMN "rider_id",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "proposal_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "pharmacists" DROP COLUMN "city",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "pharmacy_owners" DROP COLUMN "address",
DROP COLUMN "latitude",
DROP COLUMN "license_number",
DROP COLUMN "longitude",
DROP COLUMN "pharmacy_name",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "riders" DROP COLUMN "phone",
ADD COLUMN     "city" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT;

-- DropTable
DROP TABLE "inventories";

-- DropTable
DROP TABLE "order_items";

-- CreateTable
CREATE TABLE "pharmacies" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "license_number" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_stock" (
    "id" SERIAL NOT NULL,
    "pharmacy_id" INTEGER NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pharmacy_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" SERIAL NOT NULL,
    "prescription_id" INTEGER NOT NULL,
    "medicine_id" INTEGER,
    "raw_name" TEXT NOT NULL,
    "raw_strength" TEXT,
    "raw_form" TEXT,
    "quantity" INTEGER,
    "remarks" TEXT,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_items" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "prescription_item_id" INTEGER NOT NULL,
    "medicine_id" INTEGER,
    "original_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "proposal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_alternatives" (
    "id" SERIAL NOT NULL,
    "proposal_item_id" INTEGER NOT NULL,
    "pharmacy_stock_id" INTEGER NOT NULL,
    "offered_price" DECIMAL(10,2) NOT NULL,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "proposal_alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_fulfillments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "pharmacy_id" INTEGER NOT NULL,
    "rider_id" INTEGER,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_fulfillment_items" (
    "id" SERIAL NOT NULL,
    "fulfillment_id" INTEGER NOT NULL,
    "medicine_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_at_purchase" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_fulfillment_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pharmacies_owner_id_key" ON "pharmacies"("owner_id");

-- CreateIndex
CREATE INDEX "pharmacies_city_idx" ON "pharmacies"("city");

-- CreateIndex
CREATE INDEX "pharmacy_stock_pharmacy_id_idx" ON "pharmacy_stock"("pharmacy_id");

-- CreateIndex
CREATE INDEX "pharmacy_stock_medicine_id_idx" ON "pharmacy_stock"("medicine_id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_stock_pharmacy_id_medicine_id_key" ON "pharmacy_stock"("pharmacy_id", "medicine_id");

-- CreateIndex
CREATE INDEX "medicines_salt_idx" ON "medicines"("salt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_proposal_id_key" ON "orders"("proposal_id");

-- AddForeignKey
ALTER TABLE "pharmacies" ADD CONSTRAINT "pharmacies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "pharmacy_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_items" ADD CONSTRAINT "proposal_items_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_items" ADD CONSTRAINT "proposal_items_prescription_item_id_fkey" FOREIGN KEY ("prescription_item_id") REFERENCES "prescription_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_items" ADD CONSTRAINT "proposal_items_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_alternatives" ADD CONSTRAINT "proposal_alternatives_proposal_item_id_fkey" FOREIGN KEY ("proposal_item_id") REFERENCES "proposal_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_alternatives" ADD CONSTRAINT "proposal_alternatives_pharmacy_stock_id_fkey" FOREIGN KEY ("pharmacy_stock_id") REFERENCES "pharmacy_stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillment_items" ADD CONSTRAINT "order_fulfillment_items_fulfillment_id_fkey" FOREIGN KEY ("fulfillment_id") REFERENCES "order_fulfillments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillment_items" ADD CONSTRAINT "order_fulfillment_items_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
