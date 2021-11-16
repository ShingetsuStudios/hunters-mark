Hooks.on("midi-qol.preAttackRoll", (itemA, workflowA) => {
    let target = workflowA.targets.values().next().value;
    let effect = target.actor.data.effects.filter(e => e.data.changes[0].key.includes("flags.hunters-mark.") && e.data.changes[0].value === itemA.parent.data.name)
    if (effect.length != 0) {
        let curDamage = itemA.data.data.damage.parts
        let curCrit
        if (itemA.data.data.critical.threshold != null) {
            if (itemA.parent.data.flags.dnd5e.weaponCriticalThreshold > itemA.data.data.critical.threshold) {
                curCrit = itemA.data.data.critical.threshold
            } else curCrit = itemA.parent.data.flags.dnd5e.weaponCriticalThreshold
        } else {
            curCrit = itemA.parent.data.flags.dnd5e.weaponCriticalThreshold
        }
        let restore = {
            data: {
            }
        }
        let changes = {
            data: {
                damage: {
                    parts: [
                        [itemA.data.data.damage.parts[0][0],
                        itemA.data.data.damage.parts[0][1]]
                    ]

                }
            }
        }
        for (let i = 0; i < effect.length; i++) {
            if (effect[i].data.changes.length > 1) {
                for (let n = 1; n < effect[i].data.changes.length; n++) {
                    let ekey = effect[i].data.changes[n].key
                    let efval = effect[i].data.changes[n].value
                    if (ekey.includes(".damage")) {
                        if (efval.includes(",")) {
                            changes.data.damage.parts.push(efval.split(","))
                            //console.log(efval.split(","))
                        } else {
                            changes.data.damage.parts[0][0] += " + " + efval
                            //console.log(efval)
                        }
                        restore.data.damage = { parts: curDamage }
                    }
                    if (ekey.includes(".critRange")) {
                        if (efval.includes("+") || efval.includes("-")) {
                            workflowA.item.data.data.critical.threshold = curCrit + Number(efval)
                            //console.log(curCrit + Number(efval))
                        } else {
                            workflowA.item.data.data.critical.threshold = Number(efval)
                            //console.log(Number(efval))
                        }
                    }
                }
            }
        }
        workflowA.item.update(changes)
        Hooks.once("midi-qol.RollComplete", async function () {
            await workflowA.item.update(restore)
            workflowA.item.data.data.critical.threshold = curCrit
        })
    }
});