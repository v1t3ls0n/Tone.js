import { Envelope, EnvelopeOptions } from "./Envelope";
import { optionsFromArguments } from "../../core/util/Defaults";
import { NormalRange, Time } from "../../core/type/Units";
import { Pow } from "../../signal/Pow";
import { Scale } from "../../signal/Scale";

export interface ScaledEnvelopeOptions extends EnvelopeOptions {
	min: number;
	max: number;
	exponent: number;
}

/**
 * ScaledEnvelope is an envelope which can be scaled
 * to any range. It's useful for applying an envelope
 * to a frequency or any other non-NormalRange signal
 * parameter. See [[Envelope]]
 * @example
 * import { Oscillator, ScaledEnvelope } from "tone";
 * const oscillator = new Oscillator().toDestination().start();
 * const scaledEnv = new ScaledEnvelope({
 * 	attack: 0.2,
 * 	min: 200,
 * 	max: 2000
 * });
 * scaledEnv.connect(oscillator.frequency);
 */
export class ScaledEnvelope extends Envelope {
	
	readonly name: string = "ScaledEnvelope";
	
	/**
	 * The internal exponent
	 */
	private _exponent: Pow;
	
	/**
	 * The internal scale
	 */
	private _scale: Scale;
	
	input: Pow;
	output: Scale;

	/**
	 * @param attack	the attack time in seconds
	 * @param decay	the decay time in seconds
	 * @param sustain 	a percentage (0-1) of the full amplitude
	 * @param release	the release time in seconds
	 */
	constructor(attack?: Time, decay?: Time, sustain?: NormalRange, release?: Time);
	constructor(options?: Partial<ScaledEnvelopeOptions>)
	constructor() {
		super(optionsFromArguments(ScaledEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]));
		const options = optionsFromArguments(ScaledEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);

		this._exponent = this.input = new Pow({
			context: this.context,
			value: options.exponent
		});
		this._scale = this.output = new Scale({
			context: this.context,
			min: options.min,
			max: options.max
		});

		this._sig.chain(this._exponent, this._scale);
	}

	static getDefaults(): ScaledEnvelopeOptions {
		return Object.assign(Envelope.getDefaults(), {
			min: 0,
			max: 1,
			exponent: 1,
		});
	}

	/**
	 * The envelope's min output value. This is the value which it starts at.
	 */
	get min(): number {
		return this._scale.min;
	}
	set min(min) {
		this._scale.min = min;
	}
	
	/**
	 * The envelope's max output value. In other words, the value
	 * at the peak of the attack portion of the envelope.
	 */
	get max(): number {
		return this._scale.max;
	}
	set max(max) {
		this._scale.max = max;
	}
	
	/**
	 * The envelope's exponent value.
	 */
	get exponent(): number {
		return this._exponent.value;
	}
	set exponent(exponent) {
		this._exponent.value = exponent;
	}

	/**
	 * Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._scale.dispose();
		this._exponent.dispose();		
		return this;
	}
}
