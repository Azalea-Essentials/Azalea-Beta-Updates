import { world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { jsonToItem } from './conv';
import { Database } from './db';
import { isAdmin } from './isAdmin';
export function openShopUI(sender) {
  let shopDb = new Database("ShopADB2");
  let shopItems = shopDb.get("ShopItems", []);
  let actionForm = new ActionFormData();
  let categories = {};
  for (let i = 0; i < shopItems.length; i++) {
    let item = shopItems[i];
    let category = item.category || "Uncategorized";
    if (!categories[category]) categories[category] = [];
    categories[category].push({
      ...item,
      index: i
    });
  }
  let categoryKeys = Object.keys(categories);
  for (const category of categoryKeys) {
    actionForm.button(`§2${category}\n§q[ §8CLICK TO OPEN ]`);
  }
  if (isAdmin(sender)) actionForm.button(`§cEdit categories\n§4[ §8ADMINS ONLY §4]`);
  actionForm.show(sender).then(res => {
    if (res.canceled) return;
    if (isAdmin(sender) && res.selection == categoryKeys.length) {
      let categoriesForm = new ActionFormData();
      for (const category of categoryKeys) {
        categoriesForm.button(`§2${category}\n§q[ §8CLICK TO OPEN ]`);
      }
      categoriesForm.show(sender).then(res2 => {
        if (res2.canceled) return;
        let shopSubForm = new ActionFormData();
        for (const item of categories[categoryKeys[res2.selection]]) {
          shopSubForm.button(`§q${item.item.nameTag ? item.item.nameTag : item.item.typeId.split(':')[1].split('_').map(_ => _[0].toUpperCase() + _.substring(1)).join(' ')} §8x${item.item.amount ? item.item.amount : 1}\n§8$${item.price} `);
        }
        shopSubForm.show(sender).then(res3 => {
          if (res3.canceled) return;
          let item1 = categories[categoryKeys[res2.selection]][res3.selection];
          let modal = new ModalFormData().textField("Category name", "Type a category name", item1.category ? item1.category : "Uncategorized").toggle("Remove?", false);
          modal.show(sender).then(res4 => {
            if (res4.canceled) return;
            let item = shopItems[item1.index];
            item.category = res4.formValues[0];
            shopItems[item1.index] = item;
            if (res4.formValues[1]) {
              shopItems.splice(item1.index, 1);
            }
            shopDb.set("ShopItems", shopItems);
          });
        });
      });
      return;
    }
    if (res.selection >= 0 && res.selection < categoryKeys.length) {
      let shopItems2 = categories[categoryKeys[res.selection]];
      let shopSubForm = new ActionFormData();
      for (const item of shopItems2) {
        shopSubForm.button(`§q${item.item.nameTag ? item.item.nameTag : item.item.typeId.split(':')[1].split('_').map(_ => _[0].toUpperCase() + _.substring(1)).join(' ')} §8x${item.item.amount ? item.item.amount : 1}\n§8$${item.price} `);
      }
      shopSubForm.show(sender).then(res2 => {
        if (res2.canceled) return;
        let item = shopItems2[res2.selection];
        let moneyScoreboard = world.scoreboard.getObjective("money");
        let money = 0;
        try {
          money = moneyScoreboard.getScore(sender.scoreboardIdentity);
        } catch {
          money = 0;
        }
        if (!money) money = 0;
        if (money >= item.price) {
          money -= item.price;
          moneyScoreboard.setScore(sender.scoreboardIdentity, money);
          let inventory = sender.getComponent("inventory");
          inventory.container.addItem(jsonToItem(item.item));
          sender.sendMessage(`§aSuccessfully bought §q${item.item.nameTag ? item.item.nameTag : item.item.typeId.split(':')[1].split('_').map(_ => _[0].toUpperCase() + _.substring(1)).join(' ')} §8x${item.item.amount ? item.item.amount : 1} §r§afor $${item.price}`);
        } else {
          sender.sendMessage(`§cEven your moms credit card can't help you buy this. Get more money.`);
        }
      });
    }
  });
}