/**
 * An application class which provides advanced configuration for special character flags which modify an Actor
 * @implements {BaseEntitySheet}
 */
export default class ActorSheetFlags extends BaseEntitySheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return mergeObject(options, {
      id: "actor-flags",
	    classes: ["dndestiny"],
      template: "systems/dndestiny/templates/apps/actor-flags.html",
      width: 500,
      closeOnSubmit: true
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get title() {
    return `${game.i18n.localize('DNDESTINY.FlagsTitle')}: ${this.object.name}`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = {};
    data.actor = this.object;
    data.flags = this._getFlags();
    data.bonuses = this._getBonuses();
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Prepare an object of flags data which groups flags by section
   * Add some additional data for rendering
   * @return {object}
   */
  _getFlags() {
    const flags = {};
    const baseData = this.entity._data;
    for ( let [k, v] of Object.entries(CONFIG.DNDESTINY.characterFlags) ) {
      if ( !flags.hasOwnProperty(v.section) ) flags[v.section] = {};
      let flag = duplicate(v);
      flag.type = v.type.name;
      flag.isCheckbox = v.type === Boolean;
      flag.isSelect = v.hasOwnProperty('choices');
      flag.value = getProperty(baseData.flags, `dndestiny.${k}`);
      flags[v.section][`flags.dndestiny.${k}`] = flag;
    }
    return flags;
  }

  /* -------------------------------------------- */

  /**
   * Get the bonuses fields and their localization strings
   * @return {Array<object>}
   * @private
   */
  _getBonuses() {
    const bonuses = [
      {name: "data.bonuses.mwak.attack", label: "DNDESTINY.BonusMWAttack"},
      {name: "data.bonuses.mwak.damage", label: "DNDESTINY.BonusMWDamage"},
      {name: "data.bonuses.rwak.attack", label: "DNDESTINY.BonusRWAttack"},
      {name: "data.bonuses.rwak.damage", label: "DNDESTINY.BonusRWDamage"},
      {name: "data.bonuses.msak.attack", label: "DNDESTINY.BonusMSAttack"},
      {name: "data.bonuses.msak.damage", label: "DNDESTINY.BonusMSDamage"},
      {name: "data.bonuses.rsak.attack", label: "DNDESTINY.BonusRSAttack"},
      {name: "data.bonuses.rsak.damage", label: "DNDESTINY.BonusRSDamage"},
      {name: "data.bonuses.abilities.check", label: "DNDESTINY.BonusAbilityCheck"},
      {name: "data.bonuses.abilities.save", label: "DNDESTINY.BonusAbilitySave"},
      {name: "data.bonuses.abilities.skill", label: "DNDESTINY.BonusAbilitySkill"},
      {name: "data.bonuses.spell.dc", label: "DNDESTINY.BonusSpellDC"}
    ];
    for ( let b of bonuses ) {
      b.value = getProperty(this.object._data, b.name) || "";
    }
    return bonuses;
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    const actor = this.object;
    let updateData = expandObject(formData);

    // Unset any flags which are "false"
    let unset = false;
    const flags = updateData.flags.dndestiny;
    for ( let [k, v] of Object.entries(flags) ) {
      if ( [undefined, null, "", false, 0].includes(v) ) {
        delete flags[k];
        if ( hasProperty(actor._data.flags, `dndestiny.${k}`) ) {
          unset = true;
          flags[`-=${k}`] = null;
        }
      }
    }

    // Clear any bonuses which are whitespace only
    for ( let b of Object.values(updateData.data.bonuses ) ) {
      for ( let [k, v] of Object.entries(b) ) {
        b[k] = v.trim();
      }
    }

    // Diff the data against any applied overrides and apply
    await actor.update(updateData, {diff: false});
  }
}
