import ReactDOM from "react-dom";
import React, { Component } from "react";
import Cookies from "universal-cookie";

const cookies = new Cookies();

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickMultiplesArray: [10, 100, 1000],
      clickerArray: [
        {
          name: "Gold",
          total: 0,
          unlocked: true,
          cost: 0,
          incrementBy: 0.5,
          upgradeMultiplier: 1
        },
        {
          name: "Peasants",
          total: 0,
          unlocked: true,
          cost: 15,
          incrementBy: 0.4,
          upgradeMultiplier: 1
        },
        {
          name: "Farmers",
          total: 0,
          unlocked: false,
          cost: 30,
          incrementBy: 0.3,
          upgradeMultiplier: 1
        },
        {
          name: "Blacksmith",
          total: 0,
          unlocked: false,
          cost: 45,
          incrementBy: 0.2,
          upgradeMultiplier: 1
        },
        {
          name: "Knights",
          total: 0,
          unlocked: false,
          cost: 60,
          costs: "Blacksmiths",
          incrementBy: 0.15,
          upgradeMultiplier: 1
        },
        {
          name: "Baron",
          total: 0,
          unlocked: false,
          cost: 200,
          costs: "Knights",
          incrementBy: 0.1,
          upgradeMultiplier: 1
        },
        {
          name: "Earl",
          total: 0,
          unlocked: false,
          cost: 1000,
          incrementBy: 0.1,
          upgradeMultiplier: 1
        },
        {
          name: "Count",
          total: 0,
          unlocked: false,
          cost: 10000,
          incrementBy: 0.1,
          upgradeMultiplier: 1
        }
      ],
      upgradeArray: [
        {
          name: "Gold Booster",
          cost: 1000,
          affects: "Gold",
          affectsIndex: 0,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: true
        },
        {
          name: "Peasant Booster",
          cost: 5000,
          affects: "Peasants",
          affectsIndex: 1,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: false
        },
        {
          name: "Farmer Booster",
          cost: 15000,
          affects: "Farmer",
          affectsIndex: 2,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: false
        },
        {
          name: "Blacksmith Booster",
          cost: 50000,
          affects: "Blacksmiths",
          affectsIndex: 3,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: false
        },
        {
          name: "Knight Booster",
          cost: 100000,
          affects: "Knights",
          affectsIndex: 4,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: false
        },
        {
          name: "Baron Booster",
          cost: 10000000,
          affects: "Barons",
          affectsIndex: 5,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: false
        },
        {
          name: "Earl Booster",
          cost: 100000000,
          affects: "Earls",
          affectsIndex: 6,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: false
        },
        {
          name: "Count Booster",
          cost: 10000000000,
          affects: "Counts",
          affectsIndex: 7,
          type: "booster",
          bought: false,
          value: 0.25,
          visible: false
        }
      ],
      lastSave: new Date().getTime() / 1000

    };
    this.baseState = this.state;
  }

  // Jewelers after blacksmiths, can unlock diamonds, diamonds will pay for
  // upgrades.  10,000,000 gold per diamond?
  componentDidMount() {
    this.interval = setInterval(() => this.incrementer(1), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  resetGame() {
    this.setState(this.baseState);
  }

  incrementer(timeToIncrement) {
    if (timeToIncrement > 1) {
      console.log("offline for " + timeToIncrement + " seconds.");
    }
    let clickerArray = this.state.clickerArray;
    let clickerArrayLength = clickerArray.length;
    this.state.clickerArray.map((clickElement, index) => {
      if (index + 1 < clickerArrayLength) {
        if (
          this.state.clickerArray[index + 1].unlocked &&
          this.state.clickerArray[index + 1].total > 0
        ) {
          clickElement.total =
            clickElement.total +
            this.state.clickerArray[index + 1].total *
              (clickElement.incrementBy *
                clickElement.upgradeMultiplier *
                timeToIncrement);
        }
        this.setState(prevState => {
          return { clickerArray: this.state.clickerArray };
        });
      }
    });
    if (timeToIncrement > 1) {
      console.log("offline for " + timeToIncrement + " seconds.");
    }
    this.checkForUnlocks();
  }

  buyClicker(index, delta) {
    let clickElement = this.state.clickerArray[index];
    if (index !== 0) {
      let clickElementPrevious = this.state.clickerArray[index - 1];
      if (clickElementPrevious.total >= clickElement.cost * delta) {
        this.setNewTotal(index - 1, -clickElement.cost * delta);
        this.setNewTotal(index, delta);
      }
    } else {
      this.setNewTotal(index, delta);
    }
  }

  setNewTotal(index, delta) {
    let clickElement = this.state.clickerArray[index];
    clickElement.total = clickElement.total + delta;
    if (clickElement.total >= this.state.clickerArray[index + 1].cost) {
      let clickElementNext = this.state.clickerArray[index + 2];
      clickElementNext.unlocked = true;
    }
    this.setState({
      clickerArray: this.state.clickerArray
    });
  }

  buyUpgrade(index) {
    let upgradeElement = this.state.upgradeArray[index];
    let upgradeCost = upgradeElement.cost;
    let upgradeValue = upgradeElement.value;
    let upgradeAffectsIndex = upgradeElement.affectsIndex;
    let goldElement = this.state.clickerArray[0];
    if (goldElement.total >= upgradeCost) {
      this.setNewTotal(0, -upgradeElement.cost);
      upgradeElement.visible = false;
      upgradeElement.bought = true;
      this.setNewUpgradeMultiplier(upgradeAffectsIndex, upgradeValue);
      this.setState({
        clickerArray: this.state.clickerArray,
        upgradeArray: this.state.upgradeArray
      });
    }
  }

  setNewUpgradeMultiplier(index, delta) {
    let clickElement = this.state.clickerArray[index];
    // Matt, what is the point of this line?
    //clickElement.total = clickElement.total + delta;

    clickElement.upgradeMultiplier = clickElement.upgradeMultiplier + delta;
    this.setState({
      clickerArray: this.state.clickerArray
    });
  }

  checkForUnlocks() {
    let upgradeArray = this.state.upgradeArray;
    let goldElement = this.state.clickerArray[0];
    upgradeArray.forEach(
      upgradeElement =>
        (upgradeElement.visible =
          (goldElement.total >= upgradeElement.cost &&
            !upgradeElement.bought) ||
          upgradeElement.visible)
    );
    this.setState({
      upgradeArray: this.state.upgradeArray
    });
  }

  saveData() {
    console.log("save");
    console.log(this.state);
    const saveTime = new Date().getTime() / 1000;
    this.setState(
      {
        lastSave: saveTime
      },
      function() {
        let objJsonStr = JSON.stringify(this.state);
        let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
        cookies.set("saveData", objJsonB64, {
          path: "/"
        });
      }
    );
  }

  loadData() {
    console.log("load");
    let loadState = cookies.get("saveData");
    let loadedState = new Buffer(loadState, "base64").toString("ascii");
    let parsedState = JSON.parse(loadedState);
    console.log(parsedState);
    console.log(parsedState.lastSave);
    let now = new Date().getTime() / 1000;
    let timeDiff = Math.floor(now - parsedState.lastSave);
    console.log(timeDiff);
    Object.keys(parsedState).map((parsedElement, key) => {
      return this.setState({ [parsedElement]: parsedState[parsedElement] });
    });
    //this.incrementer(timeDiff);
  }

  render() {
    return (
      <div className="game">
        <div className="settings">
          <button id="save" onClick={() => this.saveData()}>
            Save
          </button>
          <button id="load" onClick={() => this.loadData()}>
            Load
          </button>
          <button id="reset" onClick={() => this.resetGame()}>
            Reset Game
          </button>
        </div>
        <div className="buttons">
          <p className="buttons-header">Clickers</p>
          {this.state.clickerArray.map((clickElement, index) => (
            <div>
              <div className={clickElement.name} key={clickElement.name}>
                {clickElement.unlocked && (
                  <div>
                    <button
                      className={index === 0 ? "gold-button" : "click-button"}
                      id={clickElement.name}
                      onClick={() => this.buyClicker(index, 1)}
                      disabled={
                        index > 0 &&
                        this.state.clickerArray[index - 1].total <
                          clickElement.cost
                      }
                    >
                      {clickElement.name} ({clickElement.total.toFixed(2)})
                      {index > 0 && (
                        <p className="click-button-cost">
                          {clickElement.cost}{" "}
                          {this.state.clickerArray[index - 1].name}
                        </p>
                      )}
                    </button>
                    <div className="multiple-click-container">
                      {index > 0 &&
                        this.state.clickMultiplesArray.map(multiple => (
                          <button
                            className="multiple-click-button"
                            id={clickElement.name + "_" + multiple}
                            onClick={() => this.buyClicker(index, multiple)}
                            disabled={
                              this.state.clickerArray[index - 1].total <=
                              clickElement.cost * multiple
                            }
                          >
                            {multiple}x
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="spacer" />
        <div className="upgrades">
          <p className="upgrades-header">Upgrades</p>
          {this.state.upgradeArray.map((upgradeElement, index) => (
            <div className={upgradeElement.name} key={upgradeElement.name}>
              {upgradeElement.visible && (
                <button
                  className="upgrade-button"
                  id={upgradeElement.name}
                  onClick={() => this.buyUpgrade(index)}
                  disabled={
                    this.state.clickerArray[0].total < upgradeElement.cost
                  }
                >
                  {upgradeElement.name}:{" "}
                  <p className="click-button-cost">
                    {upgradeElement.cost} Gold
                  </p>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("app"));
