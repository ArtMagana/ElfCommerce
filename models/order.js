'use strict';

const moment = require('moment');
const { MySQL } = require('../db');
const {
  BadRequestError,
  InvalidModelArgumentsError,
  NoRecordFoundError,
} = require('../exceptions');
require('dotenv').load();


const { host, user, password, database } = process.env;
var db = new MySQL(host, user, password, database);

function Order(
  code,
  storeId,
  addedOn,
  addedBy,
  paidOn,
  shippingAddress,
  billingAddress,
  contact,
  products,
  status = true
) {
  // If a field is optional then provide default empty value
  this.code = code;
  this.storeId = storeId;
  this.createdOn = addedOn || moment.utc().format('YYYY-MM-DD HH:mm:ss');
  this.createdBy = addedBy;
  this.paidOn = paidOn || null;
  this.shippingAddress = shippingAddress;
  this.billingAddress = billingAddress;
  this.contact = contact || '';
  this.products = products;
  this.status = status ? true : false;
}

Order.prototype.get = function (id) {
  return new Promise((resolve, reject) => {
    db.query(
      `selectcode, store_id as storeId, added_by as addedBy, added_on as addedOn, paid_on as paidOn, 
       shipping_address as shippingAddress, billing_address as billingAddress, contact, status
       from order
       where code='${id}'`,
      (error, results) => {

        if (error || results.length == 0) {
          reject(new NoRecordFoundError('No order found.'));
        } else {
          const {
            code,
            storeId,
            addedOn,
            addedBy,
            paidOn,
            shippingAddress,
            billingAddress,
            contact,
            products,
            status,
          } = results[0];
          resolve(
            new Order(
              code,
              storeId,
              addedOn,
              addedBy,
              paidOn,
              shippingAddress,
              billingAddress,
              contact,
              products,
              status
            )
          );
        }
      }
    );
  });
};

Order.prototype.getTotalCountByStoreId = function (id) {
  return new Promise((resolve, reject) => {
    db.query(
      `select count(*) as total 
       from order where store_id='${id}'`,
      (error, results) => {
        if (error) {
          reject(new NoRecordFoundError('No orders found.'));
        } else {
          resolve(results[0].total);
        }
      }
    );
  });
};

Order.prototype.getAllByStoreId = function (id, page = 1, pageSize = 20) {
  return new Promise((resolve, reject) => {
    db.query(
      `selectcode, store_id as storeId, added_by as addedBy, added_on as addedOn, paid_on as paidOn, 
       shipping_address as shippingAddress, billing_address as billingAddress, contact, status
       from order
       where store_id='${id}' order by added_on desc limit ${(page - 1) *
      pageSize}, ${pageSize}`,
      (error, results) => {

        if (error) {
          reject(new NoRecordFoundError('No orders found.'));
        } else {
          const orders = results.map(order => {
            const {
              code,
              storeId,
              addedOn,
              addedBy,
              paidOn,
              shippingAddress,
              billingAddress,
              contact,
              products,
              status,
            } = order;
            return new Order(
              code,
              storeId,
              addedOn,
              addedBy,
              paidOn,
              shippingAddress,
              billingAddress,
              contact,
              products,
              status
            );
          });

          resolve(orders);
        }
      }
    );
  });
};

Order.prototype.add = function (order) {
  return new Promise((resolve, reject) => {
    if (order instanceof Order) {
      Object.keys(order).forEach(function (key, index) {
        if (order[key] === undefined) {
          reject(
            new InvalidModelArgumentsError(
              'Not all required fields have a value.'
            )
          );
        }
      });

      const {
        code,
        storeId,
        addedOn,
        addedBy,
        paidOn,
        shippingAddress,
        billingAddress,
        contact,
        products,
      } = order;

      db.query(
        `insert into order(code, store_id, added_on, added_by, paid_on, shipping_address, billing_address, contact) 
         values('${code}', '${storeId}', '${addedOn}', '${addedBy}', ${paidOn}, ${shippingAddress}, '${billingAddress}', '${contact}')`,
        (error, results) => {
          if (error || results.affectedRows == 0) {
            reject(new BadRequestError('Invalide order data.'));
          } else {
            resolve(
              new Order(
                code,
                storeId,
                addedOn,
                addedBy,
                paidOn,
                shippingAddress,
                billingAddress,
                contact,
                products,
                true
              )
            );
          }
        }
      );
    } else {
      reject(new BadRequestError('Invalide order data.'));
    }
  });
};

Order.prototype.delete = function (code) {
  return new Promise((resolve, reject) => {
    db.query(
      `update order set status=0 where code=${code}`,
      (error, results) => {

        if (error || results.affectedRows == 0) {
          reject(new BadRequestError('Deleting order failed.'));
        } else {
          resolve('Order deleted.');
        }
      }
    );
  });
};

module.exports = Order;