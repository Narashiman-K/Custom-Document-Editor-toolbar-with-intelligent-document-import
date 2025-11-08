/**
 * Professional Header Component with Nutrient branding
 */
export default function Header({ onOpenDocument }) {
	return (
		<header className="nutrient-header">
			<div className="header-container">
				{/* Left Section: Logo */}
				<div className="header-left">
					<a
						href="https://nutrient.io"
						target="_blank"
						rel="noopener noreferrer"
						className="logo-link"
					>
						<img
							src="/logo.svg"
							width="148"
							height="44"
							alt="Nutrient Logo"
							className="logo-image"
						/>
					</a>

					{/* Open Document Button next to logo */}
					<button
						type="button"
						onClick={onOpenDocument}
						className="nav-link nav-button open-document-btn"
					>
						<span>Open Document</span>
					</button>
				</div>

				{/* Right Section: CTA Buttons */}
				<div className="header-right">
					<a
						href="https://nutrient.io/guides/"
						target="_blank"
						rel="noreferrer"
						className="btn-learn-more"
					>
						<span>Learn More</span>
					</a>
					<a
						href="https://nutrient.io/contact-sales/"
						target="_blank"
						rel="noreferrer"
						className="btn-contact-sales"
					>
						<span>Contact Sales</span>
					</a>
					<a
						href="https://nutrient.io/support/"
						target="_blank"
						rel="noreferrer"
						className="btn-contact-support"
					>
						<span>Contact Support</span>
					</a>
				</div>
			</div>
		</header>
	);
}
