import './initialLoad';
import './main';
import './auctionhouse';
import { uiManager } from './uis';
import { ActionForm } from './form_func';
import { world } from '@minecraft/server';
uiManager.addUI('banana', player => {
  let actionForm = new ActionForm();
  // actionForm.title(`Visit: Notenderman9677`);
  actionForm.title(`Visit: ${player.name}`);
  actionForm.body(`Displaying §b${player.name}'s Banana`);
  actionForm.button(`§aView`, `textures/amethyst_icons/Packs/asteroid_icons/accessibility_glyph_color`, player => {
    let why = new ActionForm();
    why.title(`Nothing`);
    why.body(`Item is too small to display`);
    why.button(`Exit`, `textures/amethyst_icons/Packs/asteroid_icons/ErrorGlyph`, player => {});
    why.show(player, false, () => {});
  });
  actionForm.button(`§cFuckk off`, `textures/amethyst_icons/Packs/asteroid_icons/Feedback`, player => {});
  actionForm.show(player, false, () => {});
});
world.afterEvents.playerInteractWithBlock.subscribe(e => {
  if (e.block.typeId == "furry:furry_block") {
    e.player.sendMessage(`§dOh, Hewwo there! How are you doing OwO`);
  }
});