<script>
	// Bright Moon
	import axios from "axios";
	import { fly, fade } from "svelte/transition";
	import {
		MaterialApp,
		Card,
		CardTitle,
		CardActions,
		TextField,
		Button,
		Row,
		Col,
		Select,
		AppBar,
		Chip,
		Dialog,
		Alert,
		Textarea,
		Icon,
	} from "svelte-materialify";

	import { mdiCheckCircle, mdiClose } from "@mdi/js";

	let itemTurnstileID = [
		{ name: "T001", value: "T001" },
		{ name: "T002", value: "T002" },
		{ name: "T003", value: "T003" },
		{ name: "T004", value: "T004" },
		{ name: "T005", value: "T005" },
		{ name: "T006", value: "T006" },
		{ name: "T007", value: "T007" },
		{ name: "T008", value: "T008" },
		{ name: "T009", value: "T009" },
		{ name: "T010", value: "T010" },
		{ name: "T011", value: "T011" },
		{ name: "T012", value: "T012" },
		{ name: "T013", value: "T013" },
	];

	//import responseCode from "../src/store";
	let header, msg, code, response, msgBoxMessage;
	let myMessage,
		message2,
		consumed_message = "";

	let show_result = false;
	let show_consumed = false;
	let show_verified = true;

	let code_success = false;
	let code_warning = false;
	let code_error = false;
	let verifiedcode = "";

	// let buttonText = "Verify";
	let buttonText = null;
	buttonText = "Verify";
	let bg_color = "primary-color";

	let show_consumed_text = false;

	let diaMsgBox = false;
	let myMsg = "";

	$: value = "";
	let error = null;
	let submitted = false;
	let hasError = false;
	let isSuccessVisible = false;
	let errMessage = "All the fields are mandatory";

	//let actionMessage

	function msgBoxClose() {
		diaMsgBox = false;
	}

	function alertBox(msg) {
		diaMsgBox = true;
		myMsg = msg;
	}

	let itemType = [
		{ name: "Barcode", value: 1 },
		{ name: "QR Code", value: 2 },
	];

	let frmData = {
		turnstileid: "",
		itemcode: "",
		itemtype: "",
		tokenid: "",
	};

	async function onclickVerify() {
		try {
			let turnstileid = frmData.turnstileid;
			let itemcode = frmData.itemcode;
			show_result = false;

			if (!frmData.turnstileid) {
				alertBox("Terminal ID is required");
			} else if (!frmData.itemtype) {
				alertBox("Code Type is required");
			} else if (!frmData.itemcode) {
				alertBox("Code is required");
			} else {
				header = "" + axios.defaults.headers.common["Authorization"];
				let response = null

				var _itemtype = frmData.itemtype;
				var _itemname = "";
				if (_itemtype === 1) {
					_itemname = "BARCODE";
					response = await axios.get(
						"AklanTerminalTicketService.verify?id=" +
							turnstileid +
							"&barcode=" +
							itemcode +
							"",
						{},
						{
							AccessControlAllowOrigin: "*",
							headers: {
								Authorization: header,
							},
							ContentType: "application/json",
						}
					);
				} else {
					_itemname = "QR CODE";
					response = await axios.get(
						"AklanTerminalTicketService.verify?id=" +
							turnstileid +
							"&qrcode=" +
							itemcode +
							"",
						{},
						{
							AccessControlAllowOrigin: "*",
							headers: {
								Authorization: header,
							},
							ContentType: "application/json",
						}
					);
				}

				let myResponse_barcode = JSON.parse(
					JSON.stringify(response)
				);
				console.log("MESSAGE: " + myResponse_barcode.data.message);
				console.log("RETCODE: " + myResponse_barcode.data.retcode);
				let api_status = myResponse_barcode.status;
				console.log(api_status);
				if (api_status == 200) {
					myMessage = myResponse_barcode.data.message;
					show_result = true;
					verifiedcode = itemcode;
					if (myResponse_barcode.data.retcode == 0) {
						let tokenid = myResponse_barcode.data.tokenid;
						frmData.tokenid = tokenid;
						message2 = myResponse_barcode.data.message;
						code_success = true;
						console.log("Token ID: " + tokenid);

						myMessage = myMessage + " ( " + _itemname + " IS VALID)";

						show_consumed = true;
						show_verified = false;
					} else {
						console.log("Barcode - " + message2);
						code_success = false;
						code_warning = true;
						show_consumed_text = false;
						message2 = myResponse_barcode.data.message;
						show_consumed = false;
						show_verified = true;
					} 
				} else if (api_status == 404) {
					show_result = false;
					alertBox("No record found");
				}
			}
		} catch (err) {
			// error handling
			alertBox(err);
		}
	}

	async function onclickConsume() {
		try {
			// code...

			let response2 = null;
			let turnstileid = frmData.turnstileid;
			let itemcode = frmData.itemcode;

			var _itemtype = frmData.itemtype;
			var _itemname = "";
			if (_itemtype === 1) {
				_itemname = "BARCODE";
				response2 = await axios.get(
					"AklanTerminalTicketService.consume?id=" +
						turnstileid +
						"&barcode=" +
						itemcode +
						"&tokenid=" +
						frmData.tokenid +
						"",
					{},
					{
						AccessControlAllowOrigin: "*",
						headers: {
							Authorization: header,
						},
						ContentType: "application/json",
					}
				);
			} else {
				_itemname = "QR CODE";
				response2 = await axios.get(
					"AklanTerminalTicketService.consume?id=" +
						turnstileid +
						"&qrcode=" +
						itemcode +
						"&tokenid=" +
						frmData.tokenid +
						"",
					{},
					{
						AccessControlAllowOrigin: "*",
						headers: {
							Authorization: header,
						},
						ContentType: "application/json",
					}
				);
			}

			let myResponse2 = JSON.parse(JSON.stringify(response2));
			console.log(myResponse2.data);

			console.log("Success Consumed: " + myResponse2.data.message);
			verifiedcode = itemcode;

			myMessage = myResponse2.data.message;
			message2 = myMessage;

			if(myResponse2.data.retcode == 0)
			{
				myMessage = myMessage + " ( " + _itemname + " CONSUMED)";
			}

			show_consumed = false;
			show_verified = true;
			frmData.tokenid = "";
			frmData.itemcode = "";
		} catch (err) {
			// error handling
			alertBox(err);
		}
	}
</script>

<MaterialApp>
	<AppBar
		style="background-color: #28a99e !important; position: fixed; top: 0; right: 0;
				left: 0; z-index: 1030;"
	>
		<div slot="icon">
			<img
				class="mt-1"
				height="50"
				src="http://103.114.198.45:9153/img/aklan_logo.18f62ead.png"
				alt="Logo"
			/>
		</div>
		<span class="white-text" slot="title">
			Provincial Government of Aklan
		</span>
	</AppBar>
	<div class="container">
		<div class="d-flex justify-center mt-5">
			<Card class="mt-10" outlined raised style="width:100%;">
				<form id="scannerForm" class:submitted>
					<Row>
						<Col
							class="pa-10 ma-2"
							cols={12}
							xl={12}
							lg={12}
							md={12}
							sm={12}
						>
							<CardTitle
								class="white-text justify-center text-uppercase"
								style="background-color: #048c7f;"
								>Caticlan and Cagban Terminal Ticket Scanner
							</CardTitle>
							{#if hasError == true}
								<p class="error-alert">{errMessage}</p>
							{:else if isSuccessVisible}
								<p
									class="error-alert"
									transition:fade={{ duration: 150 }}
								>
									Data updated successfully
								</p>
							{/if}
							<Row class="mt-3">
								<Col cols={12} md={6}>
									<Select
										chips
										outlined
										items={itemTurnstileID}
										bind:value={frmData.turnstileid}
										required
										>TERMINAL
									</Select>
								</Col>
								<Col cols={12} md={6}>
									<Select
										chips
										outlined
										items={itemType}
										bind:value={frmData.itemtype}
										required
										>CODE TYPE
									</Select>
								</Col>
							</Row>
							<Row>
								<Col cols={12} md={12}>
									<Textarea
									autogrow rows={1}
										outlined
										bind:value={frmData.itemcode}
										required
									>
										CODE
									</Textarea>
								</Col>
								<Col cols={12} md={12}>
									<TextField
										disabled
										outlined
										bind:value={frmData.tokenid}
									>
										Token ID
									</TextField>
								</Col>
							</Row>

							<Row>
								<Col cols={12} md={12}>
									{#if show_verified}
										<Button
											block
											depressed
											size="x-large"
											
											style="background-color: #F4D35e;"
											on:click={onclickVerify}
										>
											Verify
										</Button>
									{/if}

									{#if show_consumed}
										<Button
										block
											depressed
											size="x-large"
											class="green white-text"
											on:click={onclickConsume}
											>Submit
										</Button>
									{/if}
								</Col>
							</Row>
						</Col>
						<Col cols={12} xl={12} lg={12} md={12} sm={12}>
							{#if show_result}
								<Row>
									<Col
										cols={12}
										xl={12}
										lg={12}
										md={12}
										sm={12}
									>
										<div
											class="text-center"
											style="margin-bottom: 150px;"
										>
											{#if code_success}

												<div class="col-lg-12">													
													<CardTitle
														class="white-text justify-center text-uppercase"
														style="background-color: #025043;"
													>
														<h2>{myMessage}</h2>
													</CardTitle>
												</div>

											{:else if code_error}
												<Chip
													size="x-large"
													class="ma-2 red white-text"
												>
													<Icon path={mdiClose} />
													<span> {myMessage}</span>
												</Chip>
											{:else if code_warning}												
												<div class="col-lg-12">													
													<CardTitle
														class="white-text justify-center text-uppercase"
														style="background-color: #cc3300;"
													>
														<h2>{myMessage}</h2>
													</CardTitle>
												</div>
											{/if}
											<h5>TERMINAL ID: {frmData.turnstileid}</h5>
											<h5>CODE: {verifiedcode}</h5>
										</div>
									</Col>
									<!-- <Col
										cols={12}
										xl={4}
										lg={4}
										md={4}
										sm={4}
									/> -->
								</Row>
							{/if}
						</Col>
					</Row>
				</form>
			</Card>
		</div>
	</div>
</MaterialApp>
<Dialog persistent bind:active={diaMsgBox}>
	<Card>
		<CardTitle class="white-text" style="background-color: #28297d;">
			{myMsg}
		</CardTitle>
		<CardActions>
			<Button class="primary-color ml-auto" on:click={msgBoxClose}
				>Close</Button
			>
		</CardActions>
	</Card>
</Dialog>
